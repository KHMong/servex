<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TournamentCategory extends Model
{
    use HasFactory;

    protected $table = 'tournament_category';

    protected $fillable = [
        'name',
    ];

    public function selectedCategories()
    {
        return $this->hasMany(TournamentSelectedCategory::class, 'category_id');
    }
}