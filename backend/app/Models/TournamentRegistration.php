<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TournamentRegistration extends Model
{
    use HasFactory;

    protected $table = 'tournament_registration';

    protected $fillable = [
        'user_id',
        'partner_id',
        'tournament_id',
        'category_id',
        'ec_phone_no',
        'payment_status',
        'status',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function partner()
    {
        return $this->belongsTo(User::class, 'partner_id');
    }

    public function tournament()
    {
        return $this->belongsTo(Tournament::class);
    }

    public function category()
    {
        return $this->belongsTo(TournamentCategory::class, 'category_id');
    }
}