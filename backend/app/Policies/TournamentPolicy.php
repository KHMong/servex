<?php
namespace App\Policies;

use App\Models\User;
use App\Models\Tournament;

class TournamentPolicy
{
    /**
     * Determine whether the user can update the tournament.
     */
    public function update(User $user, Tournament $tournament): bool
    {
        // Only the host can update the tournament
        return $user->id === $tournament->organiser_id;
    }
}