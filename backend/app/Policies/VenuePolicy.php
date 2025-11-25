<?php
namespace App\Policies;

use App\Models\User;
use App\Models\Venue;

class VenuePolicy
{
    /**
     * Determine whether the user can update the details.
     */
    public function update(User $user, Venue $venue): bool
    {
        // Only the owner can update the details
        return $user->id === $venue->owner_id;
    }
}