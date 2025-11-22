<?php
namespace App\Http\Controllers\Api\Coach;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\TraineeGroup;
use App\Models\GroupMember;
use App\Models\User;
use App\Models\SessionAttendance;
use App\Http\Resources\GroupMemberResource;
use Carbon\Carbon;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class GroupMemberController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request, TraineeGroup $group)
    {
        $this->authorize('view', $group);

        $query = $group->activeMembers()->with('trainee');

        // Search filter (Name, Email, Phone No)
        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('trainee', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone_no', 'like', "%{$search}%")
                  ->orderBy('name', 'asc');
            });
        }

        // Gender filter
        if ($request->filled('gender')) {
            $query->whereHas('trainee', function ($q) use ($request) {
                $q->where('gender', $request->gender);
            });
        }

        return GroupMemberResource::collection($query->paginate(10));
    }

    public function addMember(Request $request, TraineeGroup $group)
    {
        $this->authorize('update', $group);

        $validated = $request->validate([
            'player_id' => ['required', 'string', 'regex:/^P\d{10}$/'],
        ]);

        // Find the player
        $player = User::where('user_id', $validated['player_id'])
            ->where('role', 'Player')
            ->where('status', 'Active')
            ->first();

        if (!$player) {
            return response()->json(['message' => 'Player not found or inactive.'], 404);
        }

        // Check if already in group
        $exists = $group->activeMembers()->where('trainee_id', $player->id)->exists();
        if ($exists) {
            return response()->json(['message' => 'Player is already in this group.'], 409);
        }

        // Add to group
        $newMember = $group->members()->create([
            'trainee_group_id' => $group->id,
            'trainee_id' => $player->id,
            'status' => 'Active'
        ]);

        // Create attendance for all upcoming scheduled sessions
        $futureSessions = $group->trainingSessions()
                                ->where('status', 'Scheduled')
                                ->get();
        
        $attendanceRecords = [];
        $now = Carbon::now();

        foreach ($futureSessions as $session) {
            $attendanceRecords[] = [
                'training_session_id' => $session->id,
                'group_member_id' => $newMember->id,
                'status' => 'Pending',
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        if (!empty($attendanceRecords)) {
            SessionAttendance::insert($attendanceRecords);
        }

        return response()->json(['message' => 'Trainee added successfully.']);
    }

    public function removeMember(GroupMember $groupMember)
    {
        $group = $groupMember->traineeGroup;
        $this->authorize('update', $group);

        // Hard delete attendance for all upcoming scheduled sessions
        SessionAttendance::where('group_member_id', $groupMember->id)
            ->whereHas('trainingSession', function ($query) {
                $query->where('status', 'Scheduled');
            })
            ->delete();

        // Soft delete the member
        $groupMember->update(['status' => 'Terminated']);

        return response()->json(['message' => 'Trainee has been removed from group.']);
    }
}