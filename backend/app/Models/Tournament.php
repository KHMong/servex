<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Tournament extends Model
{
    use HasFactory;

    protected $table = 'tournament';

    protected $fillable = [
        'organiser_id',
        'state_id',
        'name',
        'photo',
        'venue_address',
        'start_date',
        'end_date',
        'deadline',
        'description',
        'prize',
        'rule',
        'result',
        'status',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'deadline' => 'date',
    ];

    public function organiser()
    {
        return $this->belongsTo(User::class, 'organiser_id');
    }

    public function state()
    {
        return $this->belongsTo(State::class);
    }

    public function selectedCategories()
    {
        return $this->hasMany(TournamentSelectedCategory::class);
    }

    public function registrations()
    {
        return $this->hasMany(TournamentRegistration::class);
    }
}