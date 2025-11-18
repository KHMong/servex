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
     * Determine whether the user can update the activity.
     */
    public function update(User $user, Activity $activity): bool
    {
        // Only the host can update the activity
        return $user->id === $activity->user_id;
    }

    /**
     * Determine whether the user can view the activity participants.
     */
    public function viewParticipants(User $user, Activity $activity): bool
    {
        // The user is the host
        if ($user->id === $activity->user_id) {
            return true;
        }

        // The user is an active participant
        return $activity->participants()->where('activity_participant.user_id', $user->id)->where('activity_participant.status', 'Joined')->exists();
    }

    /**
     * Determine whether the user can remove the activity participants.
     */
    public function remove(User $user, Activity $activity): bool
    {
        // Only the host can remove the activity participants
        return $user->id === $activity->user_id;
    }
}