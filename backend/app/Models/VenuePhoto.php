<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\Attribute;

class VenuePhoto extends Model
{
    use HasFactory;

    protected $table = 'venue_photo';
    public $timestamps = false; // Only has created_at

    protected $fillable = [
        'venue_id',
        'photo',
    ];

    protected $casts = [
        'created_at' => 'datetime'
    ];

    public function venue()
    {
        return $this->belongsTo(Venue::class);
    }

    protected function fullPath(): Attribute
    {
        return Attribute::make(
            get: fn () => "venues/{$this->venue_id}/{$this->photo}",
        );
    }
}