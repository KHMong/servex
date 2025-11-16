<?php
namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\Activity;
use App\Models\SkillLevel;
use Illuminate\Http\Request;
use App\Http\Resources\ActivityResource;
use Carbon\Carbon;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class ActivityController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request)
    {
        $query = Activity::query()
            ->where('activity.status', '!=', 'Cancelled')
            // Only show future activities
            ->whereHas('booking', function ($q) {
                $q->where('start_datetime', '>', now());
            });

        // State filter (JOIN through booking -> court -> venue)
        if ($request->filled('state_id')) {
            $query->whereHas('booking.court.venue', function ($q) use ($request) {
                $q->where('state_id', $request->state_id);
            });
        }

        // Skill level filter
        if ($request->filled('skill_level_id')) {
            $query->where('skill_level_id', $request->skill_level_id);
        }

        // Date filter
        if ($request->filled('date')) {
            $query->whereHas('booking', function ($q) use ($request) {
                $q->whereDate('start_datetime', $request->date);
            });
        }

        // Search filter (Host name OR Venue name)
        if ($request->filled('search')) {
            $searchTerm = '%' . $request->search . '%';
            $query->where(function ($q) use ($searchTerm) {
                $q->whereHas('user', function ($userQuery) use ($searchTerm) { // Search Host Name
                    $userQuery->where('name', 'like', $searchTerm);
                })->orWhereHas('booking.court.venue', function ($venueQuery) use ($searchTerm) { // Search Venue Name
                    $venueQuery->where('name', 'like', $searchTerm);
                });
            });
        }

        // Eager loading
        $activities = $query->with([
            'user', // Host info
            'skillLevel',
            'booking.court.venue.state' // Booking, court, venue, and state info
        ])
        ->withCount('participants') // 'participants_count'
        ->join('booking', 'activity.booking_id', '=', 'booking.id') // Join for sorting
        ->orderBy('booking.start_datetime', 'asc') // Sort by booking start datetime
        ->addSelect('activity.*') // Avoid column name conflicts
        ->paginate(10);

        return ActivityResource::collection($activities);
    }

    public function getSkillLevels()
    {
        return SkillLevel::orderBy('id')->get();
    }

    public function getActivityHistory(Request $request)
    {
        $validated = $request->validate([
            'status' => 'required|in:Joining,Joined,Hosting,Hosted,Cancelled',
        ]);
        $user = $request->user();
        $today = Carbon::now('Asia/Kuala_Lumpur');

        $baseQuery = fn($q) => $q->with(['booking.court.venue', 'skillLevel']);

        switch ($validated['status']) {
            case 'Joining':
                $query = $baseQuery(
                            $user->joinedActivities()
                            ->wherePivot('status', 'Joined')
                            ->whereHas('booking', fn($q) => $q->where('start_datetime', '>', $today))
                            ->whereIn('activity.status', ['Open', 'Full'])
                        );
                break;
            case 'Joined':
                $query = $baseQuery(
                            $user->joinedActivities()
                            ->wherePivot('status', 'Joined')
                            ->whereHas('booking', fn($q) => $q->where('start_datetime', '<=', $today))
                            ->where('activity.status', 'Completed')
                        );
                break;
            case 'Hosting':
                $query = $baseQuery(
                            $user->hostedActivities()
                            ->whereHas('booking', fn($q) => $q->where('start_datetime', '>', $today))
                            ->whereIn('activity.status', ['Open', 'Full'])
                        );
                break;
            case 'Hosted':
                $query = $baseQuery(
                            $user->hostedActivities()
                            ->whereHas('booking', fn($q) => $q->where('start_datetime', '<=', $today))
                            ->where('activity.status', 'Completed')
                        );
                break;
            case 'Cancelled':
                $query = $baseQuery(
                    Activity::where('activity.status', 'Cancelled')
                    ->where(function($q) use ($user) {
                        $q->where('activity.user_id', $user->id) // Hosted by user
                        ->orWhereHas('participants', function($p) use ($user) {
                            $p->where('user_id', $user->id)->where('activity_participant.status', 'Joined'); // Joined by user
                        });
                    })
                );
                break;
        }

        $activities = $query->join('booking', 'activity.booking_id', '=', 'booking.id')
                        ->orderBy('booking.start_datetime', 'desc')
                        ->select('activity.*')
                        ->paginate(10);
        
        $activities->loadCount('participants');

        return ActivityResource::collection($activities);
    }

    public function leaveActivity(Request $request, Activity $activity)
    {
        $this->authorize('leave', $activity);

        $participant = $activity->participants()->where('user_id', $request->user()->id)->firstOrFail();
        
        if ($activity->booking->start_datetime->isPast()) {
            return response()->json(['message' => 'Cannot leave an activity that has already started.'], 422);
        }

        // Update status to Left
        $participant->update(['status' => 'Left']);
        
        // If activity was full, set it to 'Open'
        if ($activity->status === 'Full') {
            $activity->update(['status' => 'Open']);
        }

        return response()->json(['message' => 'You have left the activity.']);
    }

    public function cancelActivity(Activity $activity)
    {
        $this->authorize('cancel', $activity);

        if ($activity->booking->start_datetime->isPast()) {
            return response()->json(['message' => 'Cannot cancel an activity that has already started.'], 422);
        }

        $activity->update(['status' => 'Cancelled']);
        
        return response()->json(['message' => 'Activity cancelled successfully.']);
    }
}