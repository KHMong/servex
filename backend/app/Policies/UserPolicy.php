<?php
namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    /**
     * Determine whether the user can view the details.
     */
    public function view(User $user): bool
    {
        // Only the user can view the details
        return $user->id === auth()->id;
    }

    /**
     * Determine whether the user can update the details.
     */
    public function update(User $user): bool
    {
        // Only the user/admin can update the details
        return $user->id === auth()->id || $user->role === 'Admin';
    }
}