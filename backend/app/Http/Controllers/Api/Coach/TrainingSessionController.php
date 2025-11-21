<?php
namespace App\Http\Controllers\Api\Coach;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\TraineeGroup;
use App\Models\TrainingSession;
use App\Http\Resources\TrainingSessionResource;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class TrainingSessionController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request, TraineeGroup $group)
    {
        $this->authorize('view', $group);

        $query = $group->trainingSessions();
        $status = $request->input('status', 'Scheduled');

        if ($status === 'Scheduled') {
            // Scheduled
            $query->where('status', 'Scheduled')
                  ->orderBy('start_datetime', 'asc');
        } else {
            // Completed
            $query->where('status', 'Completed')
                  ->orderBy('start_datetime', 'desc');
        }

        return TrainingSessionResource::collection($query->paginate(10));
    }

    public function createSession(Request $request, TraineeGroup $group)
    {
        $this->authorize('update', $group);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:2000',
            'start_datetime' => 'required|date', // Allow setting past session for flexibility
            'end_datetime' => 'required|date|after:start_datetime',
        ]);

        // Check for time clashes with training sessions within the same group     
        $hasClash = TrainingSession::where('trainee_group_id', $group->id)
                                    ->where('status', '!=', 'Cancelled')
                                    ->where(function ($q) use ($validated) {
                                        $q->where('start_datetime', '<', $validated['end_datetime'])
                                        ->where('end_datetime', '>', $validated['start_datetime']);
                                    })
                                    ->exists();

        if ($hasClash) {
            return response()->json(['message' => 'This session clashes with another session in this group.'], 409);
        }

        $group->trainingSessions()->create($validated);

        return response()->json(['message' => 'Session scheduled successfully.'], 201);
    }

    public function getSessionDetails(TrainingSession $session)
    {
        $this->authorize('view', $session->traineeGroup);
        return new TrainingSessionResource($session);
    }

    public function editSessionDetails(Request $request, TrainingSession $session)
    {
        $this->authorize('update', $session->traineeGroup);

        $isCompleted = $session->status === 'Completed';

        $rules = [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:2000',
        ];

        // Only allow update datetime if session haven't complete
        if (!$isCompleted) {
            $rules['start_datetime'] = 'required|date'; // Allow setting past session for flexibility
            $rules['end_datetime'] = 'required|date|after:start_datetime';
        }

        $validated = $request->validate($rules);

        // If have change times, check for session clashes
        if (!$isCompleted && ($validated['start_datetime'] !== $session->start_datetime || $validated['end_datetime'] !== $session->end_datetime)) {
            $hasClash = TrainingSession::where('trainee_group_id', $session->trainee_group_id)
                                        ->where('id', '!=', $session->id)
                                        ->where('status', '!=', 'Cancelled')
                                        ->where(function ($q) use ($validated) {
                                            $q->where('start_datetime', '<', $validated['end_datetime'])
                                            ->where('end_datetime', '>', $validated['start_datetime']);
                                        })
                                        ->exists();

            if ($hasClash) {
                return response()->json(['message' => 'This session clashes with another session in this group.'], 409);
            }
        }

        $session->update($validated);

        return response()->json(['message' => 'Session updated successfully.']);
    }

    public function cancelSession(TrainingSession $session)
    {
        $this->authorize('delete', $session->traineeGroup);

        if ($session->status === 'Completed') {
            return response()->json(['message' => 'Cannot cancel a completed session.'], 422);
        }

        $session->update(['status' => 'Cancelled']);

        return response()->json(['message' => 'Session cancelled successfully.']);
    }
}