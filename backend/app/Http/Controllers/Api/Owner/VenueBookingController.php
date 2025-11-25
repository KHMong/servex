<?php
namespace App\Http\Controllers\Api\Owner;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Carbon\Carbon;
use App\Models\Venue;
use App\Models\Booking;
use App\Models\PricingRule;
use Illuminate\Support\Facades\DB;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class VenueBookingController extends Controller
{
    use AuthorizesRequests;

    public function getSchedule(Request $request, Venue $venue)
    {
        $this->authorize('view', $venue);
        
        $date = $request->input('date', date('Y-m-d'));

        // Get Courts
        $courts = $venue->courts()
            ->where('status', '!=', 'Terminated')
            ->with(['bookings' => function($q) use ($date) {
                $q->whereDate('start_datetime', $date)
                  ->where('status', '!=', 'Cancelled')
                  ->with('user:id,user_id,name');
            }])
            ->get();

        // Generate time slots
        $opening = Carbon::parse($date . ' ' . $venue->opening_time);
        $closing = Carbon::parse($date . ' ' . $venue->closing_time);
        if ($closing <= $opening) $closing->addDay();

        $slots = [];
        while ($opening < $closing) {
            $slots[] = $opening->format('H:i');
            $opening->addMinutes(30);
        }

        // Pricing rules
        $weekdayPrice = $venue->pricingRules()->where('day_type', 'Weekday')->value('price') ?? 0;
        $weekendPrice = $venue->pricingRules()->where('day_type', 'Weekend')->value('price') ?? 0;

        return response()->json([
            'venue_name' => $venue->name,
            'opening_time' => $venue->opening_time,
            'closing_time' => $venue->closing_time,
            'weekday_price' => (float)$weekdayPrice,
            'weekend_price' => (float)$weekendPrice,
            'slots' => $slots,
            'courts' => $courts
        ]);
    }

    public function getCourts(Venue $venue)
    {
        return $venue->courts()->where('status', 'Available')->get();
    }

    public function book(Request $request, Venue $venue)
    {
        $this->authorize('update', $venue);

        $validated = $request->validate([
            'court_id' => 'required|exists:court,id',
            'date' => 'required|date',
            'start_time' => 'required|date_format:H:i',
            'duration' => 'required|integer|min:1|max:24',
        ]);

        $startDateTime = Carbon::parse($validated['date'] . ' ' . $validated['start_time']);
        $endDateTime = $startDateTime->copy()->addHours($validated['duration']);

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
            return response()->json(['message' => "The booking must be within the venue's operating hours ({$venue->opening_time} - {$venue->closing_time})."], 409);
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
        $rule = PricingRule::where('venue_id', $venue->id)->where('day_type', $dayType)->first();
        if (!$rule) return response()->json(['message' => 'Pricing is not available for this time slot.'], 400);
        
        $price = $rule->price * $validated['duration'];

        // Create Booking
        DB::transaction(function () use ($validated, $startDateTime, $endDateTime, $price) {
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
                'user_id' => null,
                'court_id' => $validated['court_id'],
                'booking_id' => $bookingId,
                'start_datetime' => $startDateTime,
                'end_datetime' => $endDateTime,
                'total_price' => $price,
                'payment_status' => 'Paid',
                'status' => 'Confirmed',
            ]);
        }, 2);

        return response()->json(['message' => 'Booking created successfully.']);
    }

    public function cancel(Booking $booking)
    {
        $this->authorize('update', $booking->court->venue);

        // Can only cancel Confirmed/Future bookings
        if ($booking->status !== 'Confirmed') {
            return response()->json(['message' => 'Only can cancel confirmed booking.'], 409);
        }
        if ($booking->start_datetime->isPast()) {
            return response()->json(['message' => 'Cannot cancel past bookings.'], 409);
        }

        $booking->update(['status' => 'Cancelled']);
        return response()->json(['message' => 'Booking cancelled successfully.']);
    }
}