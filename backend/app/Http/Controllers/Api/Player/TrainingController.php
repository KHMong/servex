<?php
namespace App\Http\Controllers\Api\Player;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\TrainingSession;
use App\Http\Resources\PlayerGroupResource;
use App\Http\Resources\PlayerSessionResource;

class TrainingController extends Controller
{
    public function getGroups(Request $request)
    {
        $user = $request->user();

        $groups = $user->groupMembers()
            ->where('status', 'Active')
            ->with('traineeGroup.coach.user')
            ->latest()
            ->paginate(3);

        return PlayerGroupResource::collection($groups);
    }

    public function getSessions(Request $request)
    {
        $user = $request->user();
        $status = $request->input('status', 'Upcoming');

        $query = $user->sessionAttendances()
            ->with(['trainingSession.traineeGroup.coach.user']);

        if ($status === 'Upcoming') {
            $query->whereHas('trainingSession', function($q) {
                $q->where('status', 'Scheduled');
            })->orderBy(
                TrainingSession::select('start_datetime')
                    ->whereColumn('training_session.id', 'session_attendance.training_session_id')
            );
        } else {
            $query->whereHas('trainingSession', function($q) {
                $q->where('status', 'Completed');
            })->orderByDesc(
                TrainingSession::select('start_datetime')
                    ->whereColumn('training_session.id', 'session_attendance.training_session_id')
            );
        }

        $sessions = $query->paginate(10);

        return PlayerSessionResource::collection($sessions);
    }
}