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
        $activeVouchers = Voucher::where('status', 'Active')->paginate(3);
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
            'message' => 'Voucher redeemed successfully!',
            'new_points' => $user->fresh()->points,
            'new_voucher' => new VoucherHistoryResource($newVoucher->load('voucher')),
        ], 201);
    }

    public function getVoucherHistory(Request $request)
    {
        $validated = $request->validate([
            'status' => 'required|in:Available,Used,Expired',
        ]);
        
        $history = $request->user()
            ->voucherHistories()
            ->where('status', $validated['status'])
            ->with('voucher')
            ->latest()
            ->paginate(10);
        
        return VoucherHistoryResource::collection($history);
    }
}