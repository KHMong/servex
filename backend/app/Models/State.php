<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class State extends Model
{
    use HasFactory;

    protected $table = 'state';

    protected $fillable = [
        'name',
    ];

    public function venues()
    {
        return $this->hasMany(Venue::class);
    }

    public function coachProfiles()
    {
        return $this->hasMany(CoachProfile::class);
    }

    public function tournaments()
    {
        return $this->hasMany(Tournament::class);
    }
}