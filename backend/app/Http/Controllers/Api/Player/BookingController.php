<?php
namespace App\Http\Controllers\Api\Player;

use App\Http\Controllers\Controller;
use App\Models\User;
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
use Stripe\Stripe;
use Stripe\Checkout\Session;

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
        $localStartDateTimeString = $validated['date'] . ' ' . $validated['start_time'];
        $startDateTime = Carbon::parse($localStartDateTimeString);
        $startDateTimeMY = Carbon::parse($localStartDateTimeString, 'Asia/Kuala_Lumpur');
        $endDateTime = $startDateTime->copy()->addHours((int) $validated['duration']);

        // Current time in Malaysia
        $currentTime = Carbon::now('Asia/Kuala_Lumpur');

        // --- VALIDATION ---
        // 1. Booking must be in future
        if ($startDateTimeMY->lessThanOrEqualTo($currentTime)) {
            return response()->json(['message' => 'The selected start time cannot be in the past.'], 409);
        }

        // 2. Booking is within venue operating hours
        $venueOpeningTimeString = $validated['date'] . ' ' . $venue->opening_time;
        $venueClosingTimeString = $validated['date'] . ' ' . $venue->closing_time;
        $venueOpeningTime = Carbon::parse($venueOpeningTimeString);
        $venueClosingTime = Carbon::parse($venueClosingTimeString);

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

        if ($booking->status !== 'Pending') {
            return response()->json(['message' => 'Invalid booking.'], 400);
        }

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

    public function getBookingHistory(Request $request)
    {
        $validated = $request->validate([
            'status' => 'required|in:Confirmed,Completed,Cancelled',
        ]);
        
        $query = $request->user()->bookings()->with([
            'court.venue',
            'voucherHistory.voucher'
        ]);

        if ($request->filled('status')) {
            $query->where('status', $validated['status']);
        }

        if ($validated['status'] === 'Confirmed') {
            $query->orderBy('start_datetime', 'asc');
        } else {
            $query->orderBy('start_datetime', 'desc');
        }

        $bookings = $query->paginate(10);

        return BookingResource::collection($bookings);
    }

    public function cancelBooking(Booking $booking)
    {
        $this->authorize('update', $booking);

        // Only can cancel confirmed booking
        if ($booking->status !== 'Confirmed') {
            return response()->json(['message' => 'This booking cannot be cancelled.'], 409);
        }
        
        // Must be before booking start_datetime
        if ($booking->start_datetime->isPast()) {
            return response()->json(['message' => 'Ongoing or past booking cannot be cancelled.'], 409);
        }

        // Must have no associated activity
        $booking->load('activity');
        if ($booking->activity && $booking->activity->status !== 'Cancelled') {
            return response()->json([
                'message' => 'Please cancel the associated activity first before cancelling the booking.'
            ], 409);
        }

        $booking->update(['status' => 'Cancelled']);

        return response()->json(['message' => 'Booking cancelled successfully.']);
    }

    public function createCheckoutSession(Request $request, Booking $booking)
    {
        $this->authorize('update', $booking);

        if ($booking->status !== 'Pending') {
            return response()->json(['message' => 'This booking cannot be confirmed.'], 409);
        }

        // Validate voucher_history_id
        $validated = $request->validate([
            'voucher_history_id' => 'nullable|exists:voucher_history,id'
        ]);

        $totalPrice = $booking->total_price;
        $voucherHistory = null;
        $voucherHistoryId = $validated['voucher_history_id'] ?? null;

        if ($voucherHistoryId) {
            $voucherHistory = VoucherHistory::find($voucherHistoryId);

            // --- VOUCHER VALIDATION ---
            // Belongs to user
            if ($voucherHistory->user_id !== $request->user()->id) {
                return response()->json(['message' => 'This voucher is invalid for your account.'], 422);
            } 

            // Expired
            if ($voucherHistory->expiry_date < Carbon::now() || $voucherHistory->status === 'Expired') {
                return response()->json(['message' => 'This voucher has expired.'], 422);
            }

            // Used
            if ($voucherHistory->status === 'Used') {
                return response()->json(['message' => 'This voucher has already been used.'], 422);
            }
            
            $totalPrice = max(0, $booking->total_price - $voucherHistory->voucher->discount_value);
        }

        // Free
        if ($totalPrice <= 0) {
            $this->confirmBooking($booking, $request->user(), $voucherHistory);
            return response()->json([
                'status' => 'confirmed_free',
                'message' => 'Booking confirmed successfully.'
            ]);
        }

        Stripe::setApiKey(config('services.stripe.secret'));

        try {
            $session = Session::create([
                'payment_method_types' => ['card', 'fpx', 'grabpay'],
                'line_items' => [[
                    'price_data' => [
                        'currency' => 'myr',
                        'product_data' => [
                            'name' => 'Booking (' . $booking->court->name . ', ' . $booking->court->venue->name . ')',
                        ],
                        'unit_amount' => $totalPrice * 100,
                    ],
                    'quantity' => 1,
                ]],
                'mode' => 'payment',
                'success_url' => "http://localhost:3000/payment/status?session_id={CHECKOUT_SESSION_ID}&type=booking&booking_id={$booking->id}",
                'cancel_url' => "http://localhost:3000/payment/status?status=cancelled&type=booking&booking_id={$booking->id}",
                'metadata' => [
                    'booking_id' => $booking->id,
                    'voucher_history_id' => $voucherHistoryId,
                ],
                'client_reference_id' => $booking->id,
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Unable to create payment session: ' . $e->getMessage()]);
        }
        
        return response()->json(['url' => $session->url]);
    }

    public function verifyPayment(Request $request)
    {
        $validated = $request->validate(['session_id' => 'required|string']);

        Stripe::setApiKey(config('services.stripe.secret'));
        
        try {
            // Fetch the session
            $session = Session::retrieve($validated['session_id']);

            // Find records
            $metadata = $session->metadata;
            $booking = Booking::findOrFail($metadata->booking_id);
            $user = $booking->user;

            // Ensure it is the user who perform booking
            if ($user->id !== $request->user()->id) {
                return response()->json(['message' => 'Unauthorised action.'], 403);
            }

            // Check if payment was successful and booking is still pending
            if ($session->payment_status === 'paid' && $session->client_reference_id == $booking->id && $booking->status === 'Pending') {
                $voucherHistory = $metadata->voucher_history_id ? VoucherHistory::find($metadata->voucher_history_id) : null;
                $this->confirmBooking($booking, $user, $voucherHistory);
            }
            
            return response()->json(['message' => 'Booking confirmed successfully.']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Payment verification failed. ' . $e->getMessage()], 404);
        }
    }

    private function confirmBooking(Booking $booking, User $user, ?VoucherHistory $voucherHistory)
    {
        DB::transaction(function () use ($booking, $user, $voucherHistory) {
            // Price
            $totalPrice = $booking->total_price;

            // Use voucher
            if ($voucherHistory) {
                $totalPrice = max(0, $booking->total_price - $voucherHistory->voucher->discount_value);
                // Mark voucher as used
                $voucherHistory->update(['status' => 'Used', 'booking_id' => $booking->id]);
            }
            
            // Update booking
            $booking->update([
                'total_price' => $totalPrice,
                'payment_status' => 'Paid',
                'status' => 'Confirmed',
            ]);

            // Add points based on the total price
            $pointsToAdd = floor($totalPrice);
            if ($pointsToAdd > 0) {
                User::where('id', $user->id)->increment('points', $pointsToAdd);
            }
        });
    }
}