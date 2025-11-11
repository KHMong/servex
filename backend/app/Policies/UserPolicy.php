<?php
namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    /**
     * Determine whether the user can view the details.
     */
    public function view(User $user, User $model): bool
    {
        // Only the user can view the details
        return $user->id === $model->id;
    }

    /**
     * Determine whether the user can update the details.
     */
    public function update(User $user, User $model): bool
    {
        // Only the user/admin can update the details
        return $user->id === $model->id || $user->role === 'Admin';
    }
}