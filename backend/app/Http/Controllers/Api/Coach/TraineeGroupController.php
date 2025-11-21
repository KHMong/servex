<?php
namespace App\Http\Controllers\Api\Coach;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\TraineeGroup;
use App\Http\Resources\TraineeGroupResource;

class TraineeGroupController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $coachProfile = $user->coachProfile;

        $query = $coachProfile->traineeGroups()
            ->withCount([
                'activeMembers',
                'trainingSessions as scheduled_count' => function ($q) {
                    $q->where('start_datetime', '>', now());
                },
                'trainingSessions as completed_count' => function ($q) {
                    $q->where('end_datetime', '<=', now());
                }
            ]);

        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        $groups = $query->where('status', 'Active')->latest()->paginate(10);

        return TraineeGroupResource::collection($groups);
    }

    public function deleteGroup(TraineeGroup $group)
    {
        // Ensure the group belongs to the coach
        if (request()->user()->coachProfile->user_id !== $group->coach->user_id) {
            return response()->json(['message' => 'Unauthorised action.'], 403);
        }

        // Ensure there are no scheduled sessions
        $hasScheduledSessions = $group->trainingSessions()
            ->where('start_datetime', '>', now())
            ->exists();

        if ($hasScheduledSessions) {
            return response()->json(['message' => 'Cannot delete group with upcoming training sessions.'], 422);
        }

        $group->update(['status' => 'Terminated']);

        return response()->json(['message' => 'Trainee group deleted successfully.']);
    }
}