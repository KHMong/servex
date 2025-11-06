<?php
namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\Activity;
use App\Models\SkillLevel;
use Illuminate\Http\Request;
use App\Http\Resources\ActivityResource;

class ActivityController extends Controller
{
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
        ->paginate(6);

        return ActivityResource::collection($activities);
    }

    public function getSkillLevels()
    {
        return SkillLevel::orderBy('id')->get();
    }
}