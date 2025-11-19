<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TraineeGroup extends Model
{
    use HasFactory;

    protected $table = 'trainee_group';

    protected $fillable = [
        'coach_id',
        'name',
        'description',
        'status',
    ];

    public function coach()
    {
        return $this->belongsTo(User::class, 'coach_id');
    }

    public function members()
    {
        return $this->hasMany(GroupMember::class);
    }

    public function activeMembers()
    {
        return $this->hasMany(GroupMember::class)->where('status', 'Active');
    }

    public function trainingSessions()
    {
        return $this->hasMany(TrainingSession::class);
    }
}