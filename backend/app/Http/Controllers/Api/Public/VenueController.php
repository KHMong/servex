<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\Venue;
use Illuminate\Http\Request;
use App\Http\Resources\VenueResource;

class VenueController extends Controller
{
    public function index(Request $request)
    {
        $query = Venue::query()
            ->where('apply_status', 'Approved') // Approved
            ->where('status', 'Active') // Active

            // User account is active
            ->whereHas('owner', function ($q) {
                $q->where('status', 'Active');
            })

            // Owner profile is approved
            ->whereHas('owner.ownerProfile', function ($q) {
                $q->where('status', 'Approved');
            });    

        // Search filter
        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        // State filter
        if ($request->filled('state_id')) {
            $query->where('state_id', $request->state_id);
        }

        // Eager loading
        $venues = $query->with('state', 'coverPhoto')->latest()->paginate(8);

        return VenueResource::collection($venues);
    }
}