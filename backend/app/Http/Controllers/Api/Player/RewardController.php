<?php
namespace App\Http\Controllers\Api\Player;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use App\Models\Voucher;
use App\Models\VoucherHistory;
use App\Http\Resources\VoucherResource;
use App\Http\Resources\VoucherHistoryResource;

class RewardController extends Controller
{
    public function getPointsAndVouchers(Request $request)
    {
        $user = $request->user();
        $activeVouchers = Voucher::where('status', 'Active')
                                ->orderBy('point_cost', 'asc')
                                ->paginate(3);
        return VoucherResource::collection($activeVouchers)
                ->additional([
                    'points' => $user->points,
                ]);
    }

    public function redeem(Request $request, Voucher $voucher)
    {
        $user = $request->user();

        if ($voucher->status !== 'Active') {
            return response()->json(['message' => 'This voucher is not available.'], 422); 
        }
        
        if ($user->points < $voucher->point_cost) {
            return response()->json(['message' => 'Insufficient points to redeem this voucher.'], 422);
        }

        $newVoucher = DB::transaction(function () use ($user, $voucher) {
            // Deduct points
            $user->decrement('points', $voucher->point_cost);

            // Create a new voucher history
            return VoucherHistory::create([
                'user_id' => $user->id,
                'voucher_id' => $voucher->id,
                'expiry_date' => Carbon::now()->addDays($voucher->validity),
                'status' => 'Available',
            ]);
        });

        return response()->json([
            'message' => 'Voucher redeemed successfully.',
            'new_points' => $user->fresh()->points,
            'new_voucher' => new VoucherHistoryResource($newVoucher->load('voucher')),
        ], 201);
    }

    public function getVoucherHistory(Request $request)
    {
        $validated = $request->validate([
            'status' => 'required|in:Available,Used,Expired',
        ]);

        $query = $request->user()
                         ->voucherHistories()
                         ->where('voucher_history.status', $validated['status'])
                         ->with('voucher');
        
        switch ($validated['status']) {
            case 'Available':
                $query->orderBy('expiry_date', 'asc');
                break;

            case 'Used':
                $query->join('booking', 'voucher_history.booking_id', '=', 'booking.id')
                    ->orderBy('booking.start_datetime', 'desc')
                    ->select('voucher_history.*');
                break;

            case 'Expired':
                $query->orderBy('expiry_date', 'desc');
                break;
        }
        
        $history = $query->paginate(10);

        return VoucherHistoryResource::collection($history);
    }
}