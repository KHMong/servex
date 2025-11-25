<?php
namespace App\Http\Controllers\Api\Owner;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Venue;
use App\Models\Court;
use App\Http\Resources\CourtResource;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class CourtController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request, Venue $venue)
    {
        $this->authorize('view', $venue);

        $query = $venue->courts()->where('status', '!=', 'Terminated');

        // Filter (Status)
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Search filter (Name)
        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        $courts = $query->orderBy('name', 'asc')->paginate(20);

        return CourtResource::collection($courts)->additional(['venue_name' => $venue->name]);
    }

    public function addCourt(Request $request, Venue $venue)
    {
        $this->authorize('update', $venue);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $venue->courts()->create([
            'name' => $validated['name'],
            'status' => 'Available',
        ]);

        return response()->json(['message' => 'Court created successfully.']);
    }

    public function editCourtDetails(Request $request, Court $court)
    {
        $this->authorize('update', $court->venue); 

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'status' => 'required|in:Available,Maintenance',
        ]);

        $court->update($validated);

        return response()->json(['message' => 'Court updated successfully.']);
    }

    public function deleteCourt(Court $court)
    {
        $this->authorize('update', $court->venue);

        $court->update(['status' => 'Terminated']);

        return response()->json(['message' => 'Court deleted successfully.']);
    }
}