<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VenueReview extends Model
{
    use HasFactory;

    protected $table = 'venue_review';

    protected $fillable = [
        'user_id',
        'venue_id',
        'rating',
        'comment',
        'status',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function venue()
    {
        return $this->belongsTo(Venue::class);
    }
}