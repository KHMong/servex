<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TournamentSelectedCategory extends Model
{
    use HasFactory;

    protected $table = 'tournament_selected_category';
    public $timestamps = false; // Only has created_at

    protected $fillable = [
        'tournament_id',
        'category_id',
        'entry_fee',
    ];

    protected $casts = [
        'created_at' => 'datetime'
    ];

    public function tournament()
    {
        return $this->belongsTo(Tournament::class);
    }

    public function category()
    {
        return $this->belongsTo(TournamentCategory::class, 'category_id');
    }
}