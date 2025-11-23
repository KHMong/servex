<?php
namespace App\Http\Controllers\Api\Organiser;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Tournament;
use App\Http\Resources\TournamentResource;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class OrganiserTournamentController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request)
    {
        $user = $request->user();
        $query = Tournament::where('organiser_id', $user->id)
            ->withCount([
                'registrations as approved_count' => function ($q) { $q->where('status', 'Approved'); },
                'registrations as pending_count' => function ($q) { $q->where('status', 'Pending'); }
            ]);

        // Search filter (Name)
        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        // Status filter
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $tournaments = $query->orderBy('start_date', 'desc')->paginate(10);

        return TournamentResource::collection($tournaments);
    }

    public function cancel(Tournament $tournament)
    {
        $this->authorize('update', $tournament);

        if ($tournament->status !== 'Upcoming') {
            return response()->json(['message' => 'Cannot cancel an ongoing/completed/cancelled tournament.'], 422);
        }

        $tournament->update(['status' => 'Cancelled']);
        return response()->json(['message' => 'Tournament cancelled successfully.']);
    }
}