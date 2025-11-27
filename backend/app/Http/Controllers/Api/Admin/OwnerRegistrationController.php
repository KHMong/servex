<?php
namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\OwnerProfile;
use App\Http\Resources\OwnerRegistrationResource;
use Illuminate\Support\Facades\DB;

class OwnerRegistrationController extends Controller
{
    public function index(Request $request)
    {
        $query = OwnerProfile::query();

        // Filter (Status)
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Search filter (Owner Name, Company Name, Business Reg No)
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('company_name', 'like', "%$search%")
                  ->orWhere('business_reg_no', 'like', "%$search%")
                  ->orWhereHas('user', function ($u) use ($search) {
                      $u->where('name', 'like', "%$search%");
                  });
            });
        }

        $applications = $query->with('user')->latest()->paginate(30);

        return OwnerRegistrationResource::collection($applications);
    }

    public function updateStatus(Request $request, OwnerProfile $ownerProfile)
    {
        $validated = $request->validate(['status' => 'required|in:Approved,Rejected']);
        $status = $validated['status'];

        DB::transaction(function () use ($ownerProfile, $status) {
            // Update owner profile status
            $ownerProfile->update(['status' => $status]);

            // Update user status
            $userStatus = ($status === 'Approved') ? 'Active' : 'Inactive';
            $ownerProfile->user->update(['status' => $userStatus]);
        });

        return response()->json(['message' => "Owner registration set to {$status} successfully."]);
    }
}