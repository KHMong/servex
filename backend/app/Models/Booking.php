<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    use HasFactory;

    protected $table = 'booking';

    protected $fillable = [
        'user_id',
        'court_id',
        'booking_id',
        'start_datetime',
        'end_datetime',
        'total_price',
        'payment_status',
        'status',
    ];

    protected $casts = [
        'start_datetime' => 'datetime',
        'end_datetime' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function court()
    {
        return $this->belongsTo(Court::class);
    }

    public function voucherHistory()
    {
        return $this->hasOne(VoucherHistory::class);
    }

    public function activity()
    {
        return $this->hasOne(Activity::class);
    }

    // public function review()
    // {
    //     return $this->hasOne(VenueReview::class, 'id'); // Assuming booking_id in venue_review
    // }
}