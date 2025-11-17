<?php
namespace App\Policies;

use App\Models\User;
use App\Models\Activity;

class ActivityPolicy
{
    /**
     * Determine whether the user can leave the activity.
     */
    public function leave(User $user, Activity $activity): bool
    {
        // Only the user can leave the activity
        return $activity->participants()->where('activity_participant.user_id', $user->id)->where('activity_participant.status', 'Joined')->exists();
    }

    /**
     * Determine whether the user can cancel the activity.
     */
    public function cancel(User $user, Activity $activity): bool
    {
        // Only the user can cancel the activity
        return $user->id === $activity->user_id;
    }
}