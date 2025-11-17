<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Carbon\Carbon;

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

    /**
     * The "booted" method of the model.
     *
     * @return void
     */
    protected static function boot()
    {
        parent::boot();

        // When a user is created, auto-generate the user_id
        static::creating(function ($user) {
            // Prefix
            $prefix = '';
            if ($user->role === 'Player') {
                $prefix = 'P';
            } else if ($user->role === 'Owner') {
                $prefix = 'O';
            }

            // Get current date in YYMMDD format
            $datePart = Carbon::now()->format('ymd');

            // Get the latest user of the same role today
            $latestUser = User::where('role', $user->role)
                                ->whereDate('created_at', Carbon::today())
                                ->orderBy('id', 'desc')
                                ->first();

            $sequence = $latestUser ? 
                (int)substr($latestUser->user_id, -4) + 1 : // Get last 4 number, and add 1
                1; // Start at 1 (No new user today)
            
            // Leading zeros
            $paddedSequence = str_pad($sequence, 4, '0', STR_PAD_LEFT);

            /* 
                Format:
                PYYMMDD#### (Player)
                OYYMMDD#### (Owner)
             */
            $user->user_id = $prefix . $datePart . $paddedSequence;
        });
    }

    // Relationships
    public function ownerProfile()
    {
        return $this->hasOne(OwnerProfile::class, 'user_id');
    }

    public function coachProfile()
    {
        return $this->hasOne(CoachProfile::class, 'user_id');
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

    public function hostedActivities()
    {
        return $this->hasMany(Activity::class, 'user_id', 'id');
    }

    public function joinedActivities()
    {
        return $this->belongsToMany(Activity::class, 'activity_participant', 'user_id', 'activity_id')
                    ->where('activity.user_id', '!=', $this->id)
                    ->withPivot('status')
                    ->withTimestamps();
    }

    public function activityParticipations()
    {
        return $this->hasMany(ActivityParticipant::class);
    }
}