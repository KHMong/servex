<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'user';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'name',
        'gender',
        'date_of_birth',
        'email',
        'password',
        'phone_no',
        'photo',
        'role',
        'is_coach',
        'is_organiser',
        'points',
        'status',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast. (Convert to specific data types when retrieved from or saved to database)
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'date_of_birth' => 'date',
        'is_coach' => 'boolean',
        'is_organiser' => 'boolean',
        'password' => 'hashed',
    ];

    // Relationships
    public function ownerProfile()
    {
        return $this->hasOne(OwnerProfile::class, 'user_id');
    }

    public function coachProfile()
    {
        return $this->hasOne(CoachProfile::class);
    }
    
    public function organiserPass()
    {
        return $this->hasOne(OrganiserPass::class);
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }
    
    public function voucherHistories()
    {
        return $this->hasMany(VoucherHistory::class);
    }

    public function venueReviews()
    {
        return $this->hasMany(VenueReview::class);
    }

    public function tournamentRegistrations()
    {
        return $this->hasMany(TournamentRegistration::class);
    }
    
    public function activities()
    {
        return $this->hasMany(Activity::class);
    }

    public function activityParticipations()
    {
        return $this->hasMany(ActivityParticipant::class);
    }
}