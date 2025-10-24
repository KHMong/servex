<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SkillLevel extends Model
{
    use HasFactory;

    protected $table = 'skill_level';

    protected $fillable = [
        'name',
    ];

    public function activities()
    {
        return $this->hasMany(Activity::class);
    }
}