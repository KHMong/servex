<?php
namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Venue;
use App\Http\Resources\VenueApplicationResource;
use App\Http\Resources\VenueApplicationDetailResource;

class VenueApplicationController extends Controller
{
    public function index(Request $request)
    {
        $query = Venue::query()->where('apply_status', '!=', 'Cancelled')
                                ->where('status', '!=', 'Terminated');

        // Filter (Apply status)
        if ($request->filled('apply_status')) {
            $query->where('apply_status', $request->apply_status);
        }

        // Search filter (Venue Name, Owner Name, Company Name)
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%$search%")
                  ->orWhereHas('owner.ownerProfile', function($q2) use ($search) {
                      $q2->where('company_name', 'like', "%$search%");
                  })
                  ->orWhereHas('owner', function($q3) use ($search) {
                      $q3->where('name', 'like', "%$search%");
                  });
            });
        }

        $venues = $query->with(['owner', 'owner.ownerProfile'])->latest()->paginate(30);

        return VenueApplicationResource::collection($venues);
    }

    public function getVenueApplicationDetails(Venue $venue)
    {
        $venue->load(['owner.ownerProfile', 'state', 'photos']);
        return new VenueApplicationDetailResource($venue);
    }

    public function updateStatus(Request $request, Venue $venue)
    {
        $validated = $request->validate(['status' => 'required|in:Approved,Rejected']);
        
        $venue->update(['apply_status' => $validated['status']]);

        return response()->json(['message' => "Venue application status updated successfully."]);
    }
}