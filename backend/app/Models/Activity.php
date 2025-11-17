<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Activity extends Model
{
    use HasFactory;

    protected $table = 'activity';

    protected $fillable = [
        'user_id',
        'booking_id',
        'skill_level_id',
        'fee',
        'max_player',
        'status',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }

    public function skillLevel()
    {
        return $this->belongsTo(SkillLevel::class);
    }

    public function participants(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'activity_participant', 'activity_id', 'user_id')
                    ->withPivot('status')
                    ->withTimestamps();
    }

    public function participantRecords(): HasMany
    {
        return $this->hasMany(ActivityParticipant::class);
    }
}