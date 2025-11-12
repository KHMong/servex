<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\VoucherHistory;
use Illuminate\Http\Request;
use Stripe\Stripe;
use Stripe\Checkout\Session;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Api\Player\BookingController;

class PaymentController extends Controller
{
    use AuthorizesRequests;

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
        $voucherHistoryId = $validated['voucher_history_id'] ?? null;

        if ($voucherHistoryId) {
            $voucherHistory = VoucherHistory::find($voucherHistoryId);

            // --- VOUCHER VALIDATION ---
            // Belongs to user
            if ($voucherHistory->user_id !== $request->user()->id) {
                return response()->json(['message' => 'This voucher is invalid for your account.'], 409);
            }

            // Expired
            if ($voucherHistory->expiry_date < now() || $voucherHistory->status === 'Expired') {
                return response()->json(['message' => 'This voucher has expired.'], 409);
            }

            // Used
            if ($voucherHistory->status === 'Used') {
                return response()->json(['message' => 'This voucher has already been used.'], 409);
            }

            // Discount and price
            $discount = $voucherHistory->voucher->discount_value;
            $totalPrice = max(0, $booking->total_price - $discount);
        }

        // Price <= 0
        if ($totalPrice <= 0) {
            // 100%
        }

        Stripe::setApiKey(env('STRIPE_SECRET'));

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
                'success_url' => 'http://localhost:3000/booking-payment-success?session_id={CHECKOUT_SESSION_ID}',
                'cancel_url' => 'http://localhost:3000/bookings/' . $booking->id . '/summary?payment=cancelled',
                'metadata' => [
                    'booking_id' => $booking->id,
                    'voucher_history_id' => $voucherHistoryId,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Unable to create payment session: ' . $e->getMessage()]);
        }
        
        return response()->json(['url' => $session->url]);
    }

    public function verifyBookingPayment(Request $request)
    {
        $validated = $request->validate(['session_id' => 'required|string']);
        
        Stripe::setApiKey(env('STRIPE_SECRET'));
        
        try {
            // Fetch the session
            $session = \Stripe\Checkout\Session::retrieve($validated['session_id']);

            // Verify that payment was successful
            if ($session->payment_status !== 'paid' || $session->status !== 'complete') {
                return response()->json(['message' => 'Payment was not successful.'], 400);
            }

            // Find records
            $metadata = $session->metadata;
            $booking = Booking::find($metadata->booking_id);
            $user = $booking->user;

            // 4. Run the EXACT same transaction logic from the previous webhook handler
            if ($booking && $booking->status === 'Pending') {
                DB::transaction(function () use ($booking, $user, $metadata) {
                    // Discount and price
                    $voucherHistoryId = $metadata->voucher_history_id;
                    $totalPrice = $booking->total_price;

                    if ($voucherHistoryId) {
                        $voucherHistory = VoucherHistory::find($voucherHistoryId);
                        if ($voucherHistory && $voucherHistory->status === 'Available') {
                            $discount = $voucherHistory->voucher->discount_value;
                            $totalPrice = max(0, $booking->total_price - $discount);

                            // Update the voucher history record
                            $voucherHistory->status = 'Used';
                            $voucherHistory->booking_id = $booking->id;
                            $voucherHistory->save();
                        }
                    }
                    
                    // Update the booking record
                    $booking->total_price = $totalPrice;
                    $booking->payment_status = 'Paid';
                    $booking->status = 'Confirmed';
                    $booking->save();

                    // Add points based on the total price
                    $pointsToAdd = floor($totalPrice);
                    if ($pointsToAdd > 0) {
                        $user->points += $pointsToAdd;
                        $user->save();
                    }
                });
            }
            
            return response()->json(['message' => 'Payment verified and booking confirmed successfully.']);

        } catch (\Exception $e) {
            return response()->json(['message' => 'Invalid payment session.'], 404);
        }
    }
}