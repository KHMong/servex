<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GroupMember extends Model
{
    use HasFactory;

    protected $table = 'group_member';

    protected $fillable = [
        'trainee_group_id',
        'trainee_id',
        'status',
    ];

    public function traineeGroup()
    {
        return $this->belongsTo(TraineeGroup::class);
    }

    public function trainee()
    {
        return $this->belongsTo(User::class, 'trainee_id');
    }

    public function attendances()
    {
        return $this->hasMany(SessionAttendance::class);
    }
}