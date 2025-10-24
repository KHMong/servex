<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PricingRule extends Model
{
    use HasFactory;

    protected $table = 'pricing_rule';

    protected $fillable = [
        'venue_id',
        'day_type',
        'start_time',
        'end_time',
        'price',
    ];

    public function venue()
    {
        return $this->belongsTo(Venue::class);
    }
}