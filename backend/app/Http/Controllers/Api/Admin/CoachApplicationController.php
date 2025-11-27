<?php
namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\CoachProfile;
use App\Http\Resources\CoachApplicationResource;
use Illuminate\Support\Facades\DB;

class CoachApplicationController extends Controller
{
    public function index(Request $request)
    {
        $query = CoachProfile::query();

        // Filter (Status)
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter (State)
        if ($request->filled('state_id')) {
            $query->where('state_id', $request->state_id);
        }

        // Search filter (Coach Name)
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where('exp_year', 'like', "%$search%")
                  ->orWhereHas('user', function ($q) use ($search) {
                      $q->where('name', 'like', "%$search%");
                  });
        }

        $applications = $query->with(['user', 'state'])->latest()->paginate(30);

        return CoachApplicationResource::collection($applications);
    }

    public function updateStatus(Request $request, CoachProfile $coachProfile)
    {
        $validated = $request->validate(['status' => 'required|in:Approved,Rejected']);
        
        DB::transaction(function () use ($coachProfile, $validated) {
            $coachProfile->update(['status' => $validated['status']]);
            
            if ($validated['status'] === 'Approved') {
                $coachProfile->user()->update(['is_coach' => true]);
            } else if ($validated['status'] === 'Rejected') {
                $coachProfile->user()->update(['is_coach' => false]);
            }
        });

        return response()->json(['message' => "Coach application set to {$validated['status']} successfully."]);
    }
}