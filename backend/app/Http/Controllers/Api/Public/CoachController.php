<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\CoachProfile;
use Illuminate\Http\Request;
use App\Http\Resources\CoachProfileResource;

class CoachController extends Controller
{
    public function index(Request $request)
    {
        $query = CoachProfile::query()
            ->where('status', 'Approved') // Approved

            // User account is active
            ->whereHas('user', function ($q) {
                $q->where('status', 'Active');
            }); 

        // Search filter
        if ($request->filled('search')) {
            $query->whereHas('user', function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%');
            });
        }

        // State filter
        if ($request->filled('state_id')) {
            $query->where('state_id', $request->state_id);
        }

        // Eager loading
        $coaches = $query->with('user', 'state')->latest()->paginate(12);

        return CoachProfileResource::collection($coaches);
    }

    public function getCoachDetails(User $user) 
    {
        $coachProfile = $user->coachProfile()->where('status', 'Approved')->firstOrFail(); 

        // Eager loading
        $coachProfile->load('user', 'state');

        return new CoachProfileResource($coachProfile);
    }
}