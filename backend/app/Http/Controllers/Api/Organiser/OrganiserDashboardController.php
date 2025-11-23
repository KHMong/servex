<?php
namespace App\Http\Controllers\Api\Organiser;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Tournament;
use App\Models\TournamentRegistration;

class OrganiserDashboardController extends Controller
{
    public function getStats(Request $request)
    {
        $user = $request->user();
        
        $organiserTournaments = Tournament::where('organiser_id', $user->id);
        $tournamentIds = $organiserTournaments->pluck('id');

        // Total Tournaments Hosted
        $totalHosted = Tournament::where('organiser_id', $user->id)
            ->where('status', 'Completed')
            ->count();

        // Pending Registrations
        $pendingRegistrations = TournamentRegistration::whereIn('tournament_id', $tournamentIds)
            ->where('status', 'Pending')
            ->count();

        // Total Approved Participants
        $totalParticipants = TournamentRegistration::whereIn('tournament_id', $tournamentIds)
            ->where('status', 'Approved')
            ->count();

        // Upcoming Tournaments
        $upcoming = Tournament::where('organiser_id', $user->id)
            ->where('status', 'Upcoming')
            ->count();

        // Recent Registrations (Latest 10)
        $recentRegistrations = TournamentRegistration::with(['user', 'tournament'])
            ->whereIn('tournament_id', $tournamentIds)
            ->latest()
            ->take(10)
            ->get()
            ->map(function ($reg) {
                return [
                    'id' => $reg->id,
                    'player_name' => $reg->user->name,
                    'tournament_name' => $reg->tournament->name,
                    'status' => $reg->status,
                ];
            });

        return response()->json([
            'stats' => [
                'total_hosted' => $totalHosted,
                'pending_registrations' => $pendingRegistrations,
                'total_participants' => $totalParticipants,
                'upcoming_tournaments' => $upcoming,
            ],
            'recent_registrations' => $recentRegistrations
        ]);
    }

    public function getTournamentStats(Request $request)
    {
        $user = $request->user();

        $tournaments = Tournament::where('organiser_id', $user->id)
            ->withCount('registrations')
            ->orderByDesc('registrations_count')
            ->paginate(10);

        return response()->json($tournaments);
    }
}