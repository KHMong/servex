<?php
namespace App\Http\Controllers\Api\Coach;

use App\Http\Controllers\Controller;
use App\Models\SessionAttendance;
use Illuminate\Http\Request;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $coachProfile = $user->coachProfile;

        // Total Active Trainees
        $totalTrainees = $coachProfile->traineeGroups()->withCount('activeMembers')->get()->sum('active_members_count');

        // Active Trainee Groups
        $activeGroupsCount = $coachProfile->traineeGroups()->where('status', 'Active')->count();

        // Sessions This Month
        $sessionsThisMonth = $coachProfile->trainingSessions()
            ->whereBetween('start_datetime', [Carbon::now()->startOfMonth(), Carbon::now()->endOfMonth()])
            ->where('training_session.status', 'Scheduled')
            ->count();

        // Overall Attendance Rate
        $sessionIds = $coachProfile->trainingSessions()->pluck('training_session.id');
        $totalAttendances = SessionAttendance::whereIn('training_session_id', $sessionIds)->count();
        $presentCount = SessionAttendance::whereIn('training_session_id', $sessionIds)->where('status', 'Present')->count();
        $attendanceRate = $totalAttendances > 0 ? round(($presentCount / $totalAttendances) * 100) : 0;

        return response()->json([
            'stats' => [
                'total_active_trainees' => $totalTrainees,
                'active_trainee_groups' => $activeGroupsCount,
                'sessions_this_month' => $sessionsThisMonth,
                'overall_attendance_rate' => $attendanceRate . '%',
            ],
        ]);
    }

    public function getUpcomingSessions(Request $request)
    {
        $user = $request->user();
        $coachProfile = $user->coachProfile;

        $upcomingSessions = $coachProfile->trainingSessions()
            ->with('traineeGroup')
            ->where('start_datetime', '>', now())
            ->orderBy('start_datetime', 'asc')
            ->paginate(10);

        $upcomingSessions->through(fn ($session) => [
            'id' => $session->id,
            'name' => $session->name,
            'group_name' => $session->traineeGroup->name,
            'full_date' => Carbon::parse($session->start_datetime)->format('F j, Y'),
            'time_range' => Carbon::parse($session->start_datetime)->format('g:i A') . ' - ' . Carbon::parse($session->end_datetime)->format('g:i A'),
        ]);

        return response()->json($upcomingSessions);
    }
}