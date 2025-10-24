<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SessionAttendance extends Model
{
    use HasFactory;

    protected $table = 'session_attendance';

    protected $fillable = [
        'training_session_id',
        'group_member_id',
        'comment',
        'status',
    ];

    public function trainingSession()
    {
        return $this->belongsTo(TrainingSession::class);
    }

    public function groupMember()
    {
        return $this->belongsTo(GroupMember::class);
    }
}