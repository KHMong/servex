<?php

namespace App\Providers;

use Illuminate\Support\Facades\Gate;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use App\Models\User;
use App\Models\Booking;
use App\Models\TournamentRegistration;
use App\Models\VenueReview;
use App\Models\Activity;
use App\Models\TraineeGroup;
use App\Models\Tournament;
use App\Models\Venue;
use App\Policies\UserPolicy;
use App\Policies\BookingPolicy;
use App\Policies\VenueReviewPolicy;
use App\Policies\TournamentRegistrationPolicy;
use App\Policies\ActivityPolicy;
use App\Policies\TraineeGroupPolicy;
use App\Policies\TournamentPolicy;
use App\Policies\VenuePolicy;

class AuthServiceProvider extends ServiceProvider 
{
    protected $policies = [
        User::class => UserPolicy::class,
        Booking::class => BookingPolicy::class,
        VenueReview::class => VenueReviewPolicy::class,
        TournamentRegistration::class => TournamentRegistrationPolicy::class,
        Activity::class => ActivityPolicy::class,
        TraineeGroup::class => TraineeGroupPolicy::class,
        Tournament::class => TournamentPolicy::class,
        Venue::class => VenuePolicy::class,
    ];

    public function boot()
    {
        $this->registerPolicies();

        // Player only
        Gate::define('player-only', function (User $user) {
            return $user->role === 'Player' && $user->status === 'Active';
        });

        // Player (Not coach)
        Gate::define('player-not-coach', function (User $user) {
            return $user->role === 'Player' && !$user->is_coach && $user->status === 'Active';
        });

        // Player (Not organiser)
        Gate::define('player-not-organiser', function (User $user) {
            return $user->role === 'Player' && !$user->is_organiser && $user->status === 'Active';
        });

        // Coach only
        Gate::define('coach-only', function (User $user) {
            return $user->role === 'Player' && $user->is_coach && $user->coachProfile()->where('status', 'Approved')->exists() && $user->status === 'Active';
        });

        // Organiser only
        Gate::define('organiser-only', function (User $user) {
            return $user->role === 'Player' && $user->is_organiser && $user->status === 'Active';
        });

        // Owner only
        Gate::define('owner-only', function (User $user) {
            return $user->role === 'Owner' && $user->ownerProfile()->where('status', 'Approved')->exists() && $user->status === 'Active';
        });

         // Admin only
        Gate::define('admin-only', function (User $user) {
            return $user->role === 'Admin' && $user->status === 'Active';
        });
    }
}
