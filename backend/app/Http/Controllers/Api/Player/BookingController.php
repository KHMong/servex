<?php
namespace App\Http\Controllers\Api\Player;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Court;
use App\Models\PricingRule;
use App\Models\VoucherHistory;
use Illuminate\Http\Request;
use App\Http\Resources\BookingResource;
use App\Http\Resources\VoucherHistoryResource;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class BookingController extends Controller
{
    use AuthorizesRequests;

    public function book(Request $request)
    {
        $validated = $request->validate([
            'court_id' => 'required|exists:court,id',
            'date' => 'required|date_format:Y-m-d',
            'start_time' => 'required|date_format:H:i',
            'duration' => 'required|integer|min:1|max:24',
        ]);

        // Get court and venue
        $court = Court::with('venue')->findOrFail($validated['court_id']);
        $venue = $court->venue;

        // Get booking times
        $startDateTime = Carbon::parse($validated['date'] . ' ' . $validated['start_time']);
        $endDateTime = $startDateTime->copy()->addHours((int) $validated['duration']);

        // --- VALIDATION ---
        // 1. Booking must be in future
        if ($startDateTime->isPast()) {
            return response()->json(['message' => 'The selected start time cannot be in the past.'], 409);
        }

        // 2. Booking is within venue operating hours
        $venueOpeningTime = Carbon::parse($validated['date'] . ' ' . $venue->opening_time);
        $venueClosingTime = Carbon::parse($validated['date'] . ' ' . $venue->closing_time);

        // Handle overnight times (like 11:00 to 01:00)
        if ($venueClosingTime->lt($venueOpeningTime)) {
            $venueClosingTime->addDay();
        }

        if (!$startDateTime->between($venueOpeningTime, $venueClosingTime, true) || !$endDateTime->between($venueOpeningTime, $venueClosingTime, true)) {
            return response()->json(['message' => `The booking must be within the venue's operating hours ({$venue->opening_time} - {$venue->closing_time}).`], 409);
        }

        // 3. Booking not clash
        $isBooked = Booking::where('court_id', $validated['court_id'])
            ->where('start_datetime', '<', $endDateTime)
            ->where('end_datetime', '>', $startDateTime)
            ->where('status', '!=', 'Cancelled')
            ->exists();

        if ($isBooked) {
            return response()->json(['message' => 'This time slot is unavailable.'], 409);
        }

        // 4. Pricing rule
        $dayType = $startDateTime->isWeekend() ? 'Weekend' : 'Weekday';
        
        $rule = PricingRule::where('venue_id', $court->venue_id)
            ->where('day_type', $dayType)
            ->first();

        if (!$rule) {
            return response()->json(['message' => 'Pricing is not available for this time slot.'], 400);
        }
        $subtotal = $rule->price * $validated['duration'];

        // Create booking
        $booking = DB::transaction(function () use ($request, $validated, $startDateTime, $endDateTime, $subtotal) {
            $time = $startDateTime->format('ymdHi');

            $lastBooking = Booking::where('booking_id', 'LIKE', 'B' . $time . '%')
                                  ->orderBy('booking_id', 'desc')
                                  ->lockForUpdate() // Prevent race conditions
                                  ->first();
            
            $sequence = 1;
            if ($lastBooking) {
                // Get last four digits, and increment by 1
                $lastSequence = (int) substr($lastBooking->booking_id, -4);
                $sequence = $lastSequence + 1;
            }

            // Leading zeros
            $formattedSequence = str_pad($sequence, 4, '0', STR_PAD_LEFT);

            // Final booking ID
            $bookingId = 'B' . $time . $formattedSequence;

            return Booking::create([
                'user_id' => $request->user()->id,
                'court_id' => $validated['court_id'],
                'booking_id' => $bookingId,
                'start_datetime' => $startDateTime,
                'end_datetime' => $endDateTime,
                'total_price' => $subtotal,
                'payment_status' => 'Unpaid',
                'status' => 'Pending',
            ]);
        }, 2);
        
        return new BookingResource($booking->load('court.venue.state'));
    }

    public function getBookingDetails(Booking $booking) 
    {
        $this->authorize('view', $booking);

        $booking->load([
            'court.venue.state', 
            'voucherHistory.voucher'
        ]);

        return new BookingResource($booking);
    }

    public function getAvailableVouchers(Request $request) 
    {
        $user = $request->user();

        $vouchers = VoucherHistory::where('user_id', $user->id)
            ->where('status', 'Available')
            ->where('expiry_date', '>=', now())
            ->with('voucher')
            ->get();
        
        return VoucherHistoryResource::collection($vouchers);
    }
}