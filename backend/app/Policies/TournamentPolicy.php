<?php
namespace App\Policies;

use App\Models\User;
use App\Models\Tournament;

class TournamentPolicy
{
    /**
     * Determine whether the user can view the tournament.
     */
    public function view(User $user, Tournament $tournament): bool
    {
        // Only the organiser can view the tournament
        return $user->id === $tournament->organiser_id;
    }

    /**
     * Determine whether the user can update the tournament.
     */
    public function update(User $user, Tournament $tournament): bool
    {
        // Only the organiser can update the tournament
        return $user->id === $tournament->organiser_id;
    }
}