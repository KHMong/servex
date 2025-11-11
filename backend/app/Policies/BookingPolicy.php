<?php
namespace App\Policies;

use App\Models\User;
use App\Models\Booking;

class BookingPolicy
{
    /**
     * Determine whether the user can view the details.
     */
    public function view(User $user, Booking $booking): bool
    {
        // Only the user can view the details
        return $user->id === $booking->user_id;
    }

    /**
     * Determine whether the user can update the details.
     */
    public function update(User $user, Booking $booking): bool
    {
        // Only the user/owner can update the details
        return $user->id === $booking->user_id || $user->id === $booking->court->venue->owner_id;
    }
}