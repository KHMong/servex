<?php
namespace App\Http\Controllers\Api\Player;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\OrganiserPass;
use Stripe\Stripe;
use Stripe\Checkout\Session;
use Carbon\Carbon;

class OrganiserController extends Controller
{
    // Fixed price for Organiser Pass
    const ORGANISER_PASS_PRICE = 40.00;

    public function createCheckoutSession(Request $request)
    {
        $user = $request->user();

        if ($user->is_organiser) {
            return response()->json(['message' => 'You are already a tournament organiser.'], 409);
        }

        Stripe::setApiKey(env('STRIPE_SECRET'));

        try {
            $session = Session::create([
                'payment_method_types' => ['card', 'fpx', 'grabpay'],
                'line_items' => [[
                    'price_data' => [
                        'currency' => 'myr',
                        'product_data' => [
                            'name' => 'ServeX Tournament Organiser Pass',
                        ],
                        'unit_amount' => self::ORGANISER_PASS_PRICE * 100,
                    ],
                    'quantity' => 1,
                ]],
                'mode' => 'payment',
                'success_url' => 'http://localhost:3000/payment/status?session_id={CHECKOUT_SESSION_ID}&type=organiser_pass',
                'cancel_url' => 'http://localhost:3000/payment/status?status=cancelled&type=organiser_pass',
                'client_reference_id' => $user->id,
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Unable to create payment session: ' . $e->getMessage()]);
        }

        return response()->json(['url' => $session->url]);
    }

    public function verifyPayment(Request $request)
    {
        $sessionId = $request->input('session_id');

        Stripe::setApiKey(env('STRIPE_SECRET'));

        $user = $request->user();

        try {
            // Fetch the session
            $session = Session::retrieve($sessionId);

            // Verify that payment was successful
            if ($session->payment_status === 'paid' && $session->client_reference_id == $user->id) {
                // Check if this pass has already been processed
                if (OrganiserPass::where('user_id', $user->id)->exists()) {
                    return response()->json(['message' => 'Payment already verified.']);
                }

                // Create the organiser pass record
                OrganiserPass::create([
                    'user_id' => $user->id,
                    'amount' => self::ORGANISER_PASS_PRICE,
                    'purchase_date' => Carbon::now('Asia/Kuala_Lumpur'),
                ]);

                $user->update(['is_organiser' => true]);

                $user->refresh();
                
                return response()->json(['message' => 'Organiser Pass activated successfully.']);
            }
            throw new \Exception('Payment not successful.');
        } catch (\Exception $e) {
            return response()->json(['message' => 'Payment verification failed. ' . $e->getMessage()], 400);
        }
    }
}