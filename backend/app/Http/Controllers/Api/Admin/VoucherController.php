<?php
namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Voucher;
use App\Http\Resources\VoucherManagementResource;

class VoucherController extends Controller
{
    public function index(Request $request)
    {
        $query = Voucher::query();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('code', 'like', "%$search%")
                  ->orWhere('description', 'like', "%$search%");
            });
        }

        $vouchers = $query->latest()->paginate(10);
        return VoucherManagementResource::collection($vouchers);
    }

    public function createVoucher(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|unique:voucher,code',
            'description' => 'required|string|max:255',
            'discount_value' => 'required|numeric|min:0.01|max:9999',
            'point_cost' => 'required|integer|min:1|max:9999',
            'validity' => 'required|integer|min:1|max:99999',
            'status' => 'required|in:Active,Inactive',
        ]);

        Voucher::create($validated);
        return response()->json(['message' => 'Voucher created successfully.']);
    }

    public function getVoucherDetails(Voucher $voucher)
    {
        return new VoucherManagementResource($voucher);
    }

    public function editVoucherDetails(Request $request, Voucher $voucher)
    {
        $validated = $request->validate([
            'code' => 'required|string|unique:voucher,code,' . $voucher->id,
            'description' => 'required|string|max:255',
            'discount_value' => 'required|numeric|min:0.01|max:9999',
            'point_cost' => 'required|integer|min:1|max:9999',
            'validity' => 'required|integer|min:1|max:99999',
            'status' => 'required|in:Active,Inactive',
        ]);

        $voucher->update($validated);
        return response()->json(['message' => 'Voucher updated successfully.']);
    }

    public function deleteVoucher(Voucher $voucher)
    {
        $voucher->update(['status' => 'Terminated']);

        return response()->json(['message' => 'Voucher deleted successfully.']);
    }
}