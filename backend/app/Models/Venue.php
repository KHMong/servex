<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Venue extends Model
{
    use HasFactory;

    protected $table = 'venue';

    protected $fillable = [
        'owner_id',
        'state_id',
        'name',
        'address',
        'opening_time',
        'closing_time',
        'phone_no',
        'apply_status',
        'status',
    ];

    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function state()
    {
        return $this->belongsTo(State::class);
    }

    public function photos()
    {
        return $this->hasMany(VenuePhoto::class);
    }

    public function coverPhoto()
    {
        return $this->hasOne(VenuePhoto::class)->oldestOfMany();
    }

    public function pricingRules()
    {
        return $this->hasMany(PricingRule::class);
    }

    public function bookings()
    {
        return $this->hasManyThrough(Booking::class, Court::class);
    }

    public function courts()
    {
        return $this->hasMany(Court::class);
    }

    public function reviews()
    {
        return $this->hasMany(VenueReview::class);
    }
}