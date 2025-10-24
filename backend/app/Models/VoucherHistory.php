<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VoucherHistory extends Model
{
    use HasFactory;

    protected $table = 'voucher_history';

    protected $fillable = [
        'user_id',
        'voucher_id',
        'booking_id',
        'expiry_date',
        'status',
    ];

    protected $casts = [
        'expiry_date' => 'date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function voucher()
    {
        return $this->belongsTo(Voucher::class);
    }

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }
}