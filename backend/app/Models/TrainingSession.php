<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TrainingSession extends Model
{
    use HasFactory;

    protected $table = 'training_session';

    protected $fillable = [
        'trainee_group_id',
        'name',
        'description',
        'start_datetime',
        'end_datetime',
        'status',
    ];

    protected $casts = [
        'start_datetime' => 'datetime',
        'end_datetime' => 'datetime',
    ];

    public function traineeGroup()
    {
        return $this->belongsTo(TraineeGroup::class);
    }

    public function attendances()
    {
        return $this->hasMany(SessionAttendance::class);
    }
}