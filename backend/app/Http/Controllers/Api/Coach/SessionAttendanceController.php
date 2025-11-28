<?php
namespace App\Http\Controllers\Api\Coach;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\TrainingSession;
use App\Models\SessionAttendance;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class SessionAttendanceController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request, TrainingSession $session)
    {
        $this->authorize('view', $session->traineeGroup);

        // Get existing attendance records
        $attendances = SessionAttendance::where('training_session_id', $session->id)
            ->with(['groupMember.trainee'])
            ->paginate(30);

        // Get trainee data
        $attendances->through(function ($record) {
            return [
                'member_id' => $record->group_member_id,
                'name' => $record->groupMember->trainee->name,
                'photo_path' => $record->groupMember->trainee->photo 
                    ? "users/{$record->groupMember->trainee->id}/{$record->groupMember->trainee->photo}" 
                    : null,
                'is_present' => $record->status === 'Present',
                'status' => $record->status,
                'comment' => $record->comment,
            ];
        });

        return response()->json([
            'session' => [
                'name' => $session->name,
                'group_id' => $session->trainee_group_id,
                'date_time' => Carbon::parse($session->start_datetime)->format('F j, Y \a\t g:i A'),
            ],
            'trainees' => $attendances
        ]);
    }

    public function update(Request $request, TrainingSession $session)
    {
        $this->authorize('update', $session->traineeGroup);
        
        $request->validate(['member_id' => 'required|exists:group_member,id']);

        $status = $request->boolean('is_present') ? 'Present' : 'Absent';
        
        // Update attendance record
        $updated = SessionAttendance::where('training_session_id', $session->id)
            ->where('group_member_id', $request->member_id)
            ->update(['status' => $status]);

        // No attendance record
        if ($updated === 0) {
            return response()->json(['message' => 'Attendance record not found.'], 404);
        }

        return response()->json(['message' => 'Updated']);
    }

    public function batchUpdate(Request $request, TrainingSession $session)
    {
        $this->authorize('update', $session->traineeGroup);
        $status = $request->boolean('mark_all_present') ? 'Present' : 'Absent';
        
        // Update all attendance records
        SessionAttendance::where('training_session_id', $session->id)
            ->update(['status' => $status]);

        return response()->json(['message' => 'Session attendance records updated successful']);
    }

    public function saveComments(Request $request, TrainingSession $session)
    {
        $this->authorize('update', $session->traineeGroup);
        
        $comments = $request->input('comments');

        DB::transaction(function () use ($session, $comments) {
            foreach ($comments as $item) {
                SessionAttendance::where('training_session_id', $session->id)
                    ->where('group_member_id', $item['member_id'])
                    ->update(['comment' => $item['text']]);
            }
        });

        return response()->json(['message' => 'Comments saved successfully.']);
    }
}