<?php
namespace App\Http\Controllers\Api\Owner;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Venue;
use App\Http\Resources\OwnerVenueResource;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class OwnerVenueController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request)
    {
        $user = $request->user();
        $query = Venue::where('owner_id', $user->id);

        // Filter (Application status)
        if ($request->filled('apply_status')) {
            $query->where('apply_status', $request->apply_status);
        }

        // Filter (Status)
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Search filter (Name)
        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        $query->where('status', '!=', 'Terminated');

        $venues = $query->withCount(['courts' => function($q) {
            $q->where('status', '!=', 'Terminated');
        }])->latest()->paginate(10);

        return OwnerVenueResource::collection($venues);
    }

    public function cancelVenueApplication(Venue $venue)
    {
        $this->authorize('update', $venue);

        if ($venue->apply_status !== 'Pending') {
            return response()->json(['message' => 'You can only cancel Pending venue application.']);
        }

        $venue->update(['apply_status' => 'Cancelled']);

        return response()->json(['message' => 'Venue application cancelled successfully.']);
    }

    public function deleteVenue(Venue $venue)
    {
        $this->authorize('update', $venue);

        $venue->update(['status' => 'Terminated']);

        return response()->json(['message' => 'Venue deleted successfully.']);
    }
}