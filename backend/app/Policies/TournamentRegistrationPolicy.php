<?php
namespace App\Policies;

use App\Models\User;
use App\Models\TournamentRegistration;

class TournamentRegistrationPolicy
{
    /**
     * Determine whether the user can view the details.
     */
    public function view(User $user, TournamentRegistration $tournamentRegistration): bool
    {
        // Only the user/partner can view the details
        return $user->id === $tournamentRegistration->user_id || $user->id === $tournamentRegistration->partner_id;
    }

    /**
     * Determine whether the user can update the details.
     */
    public function update(User $user, TournamentRegistration $tournamentRegistration)
    {
        // Only the user/organiser can update the details
        return $user->id === $tournamentRegistration->user_id || $user->id === $tournamentRegistration->tournament->organiser_id;
    }

    /**
     * Determine whether the user can update the statuses.
     */
    public function updateStatus(User $user, TournamentRegistration $tournamentRegistration)
    {
        // Only the organiser can update the statuses
        return $user->id === $tournamentRegistration->tournament->organiser_id;
    }
}