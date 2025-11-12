<?php
namespace App\Policies;

use App\Models\User;
use App\Models\VenueReview;

class VenueReviewPolicy
{
    /**
     * Determine whether the user can view the details.
     */
    public function view(User $user, VenueReview $venueReview): bool
    {
        // Only the user can view the details
        return $user->id === $venueReview->user_id;
    }

    /**
     * Determine whether the user can update the details.
     */
    public function update(User $user, VenueReview $venueReview): bool
    {
        // Only the user/admin can update the details
        return $user->id === $venueReview->user_id || $user->role === 'Admin';
    }
}