<?php
namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\Activity;
use App\Models\Booking;
use App\Models\SkillLevel;
use App\Models\ActivityParticipant;
use App\Http\Resources\ActivityParticipantResource;
use App\Http\Resources\ActivityResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Carbon\Carbon;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class ActivityController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request)
    {
        $query = Activity::query()
            ->whereIn('activity.status', ['Open', 'Full'])
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
            'booking.court.venue.state', // Booking, court, venue, and state info
            'participants'
        ])
        ->withCount(['participants' => function ($query) {
            $query->where('activity_participant.status', 'Joined');
        }])
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

        $baseWith = ['booking.court.venue', 'skillLevel'];
        $participantCount = ['participants' => function ($query) {
            $query->where('activity_participant.status', 'Joined');
        }];

        switch ($validated['status']) {
            case 'Joining':
                $query = $user->joinedActivities()
                         ->wherePivot('status', 'Joined')
                         ->whereHas('booking', fn($q) => $q->where('end_datetime', '>', $today))
                         ->whereIn('activity.status', ['Open', 'Full']);
                break;
            case 'Joined':
                $query = $user->joinedActivities()
                         ->wherePivot('status', 'Joined')
                         ->whereHas('booking', fn($q) => $q->where('end_datetime', '<=', $today))
                         ->where('activity.status', 'Completed');
                break;
            case 'Hosting':
                $query = $user->hostedActivities()
                         ->whereHas('booking', fn($q) => $q->where('end_datetime', '>', $today))
                         ->whereIn('activity.status', ['Open', 'Full']);
                break;
            case 'Hosted':
                $query = $user->hostedActivities()
                         ->whereHas('booking', fn($q) => $q->where('end_datetime', '<=', $today))
                         ->where('activity.status', 'Completed');
                break;
            case 'Cancelled':
                $query = Activity::where('activity.status', 'Cancelled')
                        ->where(function($q) use ($user) {
                            $q->where('activity.user_id', $user->id) // Hosted by user
                            ->orWhereHas('participants', function($p) use ($user) {
                                $p->where('activity_participant.user_id', $user->id)->where('activity_participant.status', 'Joined'); // Joined by user
                            });
                        });
                break;
        }

        $sortByBookingDate = Booking::select('start_datetime')
                            ->whereColumn('booking.id', 'activity.booking_id')
                            ->limit(1);

        $finalQuery = $query->with($baseWith)
                            ->withCount($participantCount);

        if (in_array($validated['status'], ['Joining', 'Hosting'])) {
            $finalQuery->orderBy($sortByBookingDate, 'asc');
        } else {
            $finalQuery->orderBy($sortByBookingDate, 'desc');
        }

        $activities = $finalQuery->paginate(10);

        return ActivityResource::collection($activities);
    }

    public function joinActivity(Request $request, Activity $activity)
    {
        $user = $request->user();
        
        if ($user->role !== 'Player') {
            return response()->json(['message' => 'Only players can join activities.'], 403);
        }

        return DB::transaction(function () use ($user, $activity) {
            $activity = Activity::withCount(['participants' => function ($query) {
                $query->where('activity_participant.status', 'Joined');
            }])->lockForUpdate()->findOrFail($activity->id);

            // Validation
            if ($activity->user_id === $user->id) { // Host of the activity
                return response()->json(['message' => 'You have already joined this activity as a host.'], 422);
            }
            if ($activity->participants()->where('activity_participant.user_id', $user->id)->where('activity_participant.status', 'Joined')->exists()) { // Already joined
                return response()->json(['message' => 'You have already joined this activity.'], 422);
            }
            if ($activity->participants_count >= $activity->max_player) { // Full
                return response()->json(['message' => 'This activity is already full.'], 422);
            }

            // Create activity participant record
            $activity->participantRecords()->create([
                'user_id' => $user->id,
                'status' => 'Joined',
            ]);

            // Update activity status if full
            if (($activity->participants_count + 1) >= $activity->max_player) {
                $activity->update(['status' => 'Full']);
            }

            return response()->json(['message' => 'You have successfully joined the activity.']);
        });
    }

    public function leaveActivity(Request $request, Activity $activity)
    {
        $user = $request->user();

        $this->authorize('leave', $activity);
        
        $activity->load('booking');
        if ($activity->booking->start_datetime->isPast()) {
            return response()->json(['message' => 'Cannot leave an activity that has already started.'], 422);
        }

        // Update status to Left
        $activity->participants()->updateExistingPivot($user->id, [
            'status' => 'Left',
        ]);
        
        // If activity was full, set it to 'Open'
        if ($activity->status === 'Full') {
            $activity->update(['status' => 'Open']);
        }

        return response()->json(['message' => 'You have left the activity.']);
    }

    public function cancelActivity(Activity $activity)
    {
        $this->authorize('update', $activity);

        $activity->load('booking');
        if ($activity->booking->start_datetime->isPast()) {
            return response()->json(['message' => 'Cannot cancel an activity that has already started.'], 422);
        }

        $activity->update(['status' => 'Cancelled']);
        
        return response()->json(['message' => 'Activity cancelled successfully.']);
    }

    public function getParticipants(Activity $activity)
    {
        $this->authorize('viewParticipants', $activity);

        // Get host
        $host = $activity->user;

        // Get participants
        $participants = $activity->participants()
                                ->where('activity_participant.status', 'Joined')
                                ->where('activity_participant.user_id', '!=', $host->id)
                                ->get();
        
        // Add is_host (true) and participant_id (null) for the host
        $host->is_host = true;
        $host->participant_id = null;

        // Add is_host (false) and participant_id for each participant
        foreach ($participants as $participant) {
            $participant->is_host = false;
            $participant->participant_id = $participant->pivot->id;
        }

        // Combine host and participants
        $allParticipants = collect([$host])->merge($participants);

        return ActivityParticipantResource::collection($allParticipants);
    }
    
    public function removeParticipant(ActivityParticipant $activityParticipant)
    {
        $this->authorize('remove', $activityParticipant->activity);

        // Prevent host from removing themselves
        if ($activityParticipant->user_id === $activityParticipant->activity->user_id) {
            return response()->json(['message' => 'You cannot remove yourself.'], 422);
        }

        $activityParticipant->update(['status' => 'Removed']);
        
        // If status was full, set it to 'Open'
        if ($activityParticipant->activity->status === 'Full') {
            $activityParticipant->activity->update(['status' => 'Open']);
        }

        return response()->json(['message' => 'Participant removed successfully.']);
    }

    public function getForm(Request $request)
    {
        $user = $request->user();

        // Requirements:
        // 1. Belong to the current user
        // 2. Booking status is Confirmed
        // 3. Hasn't pass the start_datetime
        // 4. Don't have an associated activity
        $bookingChoices = $user->bookings()
            ->where('status', 'Confirmed')
            ->where('start_datetime', '>', now())
            ->whereDoesntHave('activity', function ($query) {
                $query->where('status', '!=', 'Cancelled');
            })
            ->with('court.venue')
            ->orderBy('start_datetime', 'asc')
            ->get();

        return response()->json([
            'booking_choices' => $bookingChoices->map(function ($booking) {
                return [
                    'id' => $booking->id,
                    'booking_text' => '[' . $booking->booking_id . '] ' .  
                                $booking->court->venue->name . ' - ' . 
                                $booking->court->name . ' @ ' . 
                                Carbon::parse($booking->start_datetime)->format('M d, Y, h:i A'),
                ];
            }),
            'skill_levels' => SkillLevel::all(),
        ]);
    }

    public function create(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'booking_id' => [
                'required',
                Rule::exists('booking', 'id')->where(function ($query) use ($user) {
                    $query->where('user_id', $user->id)
                          ->where('status', 'Confirmed')
                          ->where('start_datetime', '>', now());
                }),
            ],
            'skill_level_id' => 'required|exists:skill_level,id',
            'fee' => 'required|numeric|min:0|max:9999',
            'max_player' => 'required|integer|min:2|max:999',
        ]);

        // Ensure booking does not have an associated activity
        if (Activity::where('booking_id', $validated['booking_id'])->where('status', '!=', 'Cancelled')->exists()) {
            return response()->json(['message' => 'This booking is already associated with an activity.'], 422);
        }

        $activity = DB::transaction(function () use ($user, $validated) {
            // Create the activity record
            $activity = Activity::create([
                'user_id' => $user->id,
                'booking_id' => $validated['booking_id'],
                'skill_level_id' => $validated['skill_level_id'],
                'fee' => $validated['fee'],
                'max_player' => $validated['max_player'],
                'status' => 'Open',
            ]);

            // Automatically add the host as the first participant
            $activity->participantRecords()->create([
                'user_id' => $user->id,
                'status' => 'Joined',
            ]);
            
            return $activity;
        });

        return response()->json([
            'message' => 'Activity created successfully!',
            'activity_id' => $activity->id,
        ], 201);
    }

    public function getActivityDetails(Activity $activity)
    {
        $this->authorize('update', $activity);

        // Must be Open/Full
        if (!in_array($activity->status, ['Open', 'Full'])) {
            return response()->json(['message' => 'This activity cannot be edited.'], 422);
        }

        $activity->load('booking.court.venue');
        
        return response()->json([
            'activity' => [
                'booking_id' => $activity->booking->booking_id,
                'skill_level_id' => $activity->skill_level_id,
                'fee' => $activity->fee,
                'max_player' => $activity->max_player,
                'booking_text' => '[' . $activity->booking->booking_id . '] ' .
                                          $activity->booking->court->venue->name . ' - ' . 
                                          $activity->booking->court->name . ' @ ' . 
                                          Carbon::parse($activity->booking->start_datetime)->format('M d, Y, h:i A'),
            ],
            'skill_levels' => SkillLevel::all(),
        ]);
    }

    public function editActivityDetails(Request $request, Activity $activity)
    {
        $this->authorize('update', $activity);

        // Must be Open/Full
        if (!in_array($activity->status, ['Open', 'Full'])) {
            return response()->json(['message' => 'This activity cannot be edited.'], 422);
        }

        $currentParticipantCount = $activity->participants()->where('activity_participant.status', 'Joined')->count();

        $validated = $request->validate([
            'skill_level_id' => 'required|exists:skill_level,id',
            'fee' => 'required|numeric|min:0|max:9999',
            'max_player' => 'required|integer|min:2|max:999',
        ]);

        $newMaxPlayer = (int) $validated['max_player'];

        // Max player cannot be less than current number of participants
        if ($newMaxPlayer < $currentParticipantCount) {
            return response()->json(['message' => 'Max player cannot be less than the current number of participants.'], 422);
        }

        // Same number and currently is Open
        if ($newMaxPlayer === $currentParticipantCount && $activity->status === 'Open') {
            $validated['status'] = 'Full';
        }

        // Larger max player and currently is Full
        if ($newMaxPlayer > $currentParticipantCount && $activity->status === 'Full') {
            $validated['status'] = 'Open';
        }

        $activity->update($validated);

        return response()->json([
            'message' => 'Activity updated successfully!',
            'activity_id' => $activity->id,
        ]);
    }
}