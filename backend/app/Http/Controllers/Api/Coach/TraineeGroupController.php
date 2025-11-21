<?php
namespace App\Http\Controllers\Api\Coach;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\TraineeGroup;
use App\Http\Resources\TraineeGroupResource;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class TraineeGroupController extends Controller
{
    use AuthorizesRequests;

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

    public function createGroup(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:2000',
        ]);

        $request->user()->coachProfile->traineeGroups()->create([
            'name' => $validated['name'],
            'description' => $validated['description'],
            'status' => 'Active'
        ]);

        return response()->json(['message' => 'Trainee group created successfully.'], 201);
    }

    public function getGroupInfo(TraineeGroup $group)
    {
        $this->authorize('view', $group);

        return new TraineeGroupResource($group);
    }

    public function editGroupInfo(Request $request, TraineeGroup $group)
    {
        $this->authorize('update', $group);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:2000',
        ]);

        $group->update($validated);

        return response()->json(['message' => 'Trainee group updated successfully.']);
    }

    public function deleteGroup(TraineeGroup $group)
    {
        $this->authorize('delete', $group);

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