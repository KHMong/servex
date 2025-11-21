<?php

namespace App\Policies;

use App\Models\User;
use App\Models\TraineeGroup;

class TraineeGroupPolicy
{
    /**
     * Determine whether the user can view the trainee group details.
     */
    public function view(User $user, TraineeGroup $traineeGroup): bool
    {
        // Only the coach can view it
        return $user->coachProfile && $user->coachProfile->user_id === $traineeGroup->coach_id;
    }

    /**
     * Determine whether the user can update the trainee group.
     */
    public function update(User $user, TraineeGroup $traineeGroup): bool
    {
        // Only the coach can update it
        return $user->coachProfile && $user->coachProfile->user_id === $traineeGroup->coach_id;
    }

    /**
     * Determine whether the user can delete the trainee group.
     */
    public function delete(User $user, TraineeGroup $traineeGroup): bool
    {
        // Only the coach can delete it
        return $user->coachProfile && $user->coachProfile->user_id === $traineeGroup->coach_id;
    }
}