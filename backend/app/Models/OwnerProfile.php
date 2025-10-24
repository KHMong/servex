<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OwnerProfile extends Model
{
    use HasFactory;

    protected $table = 'owner_profile';
    
    protected $primaryKey = 'user_id';
    public $incrementing = false;

    protected $fillable = [
        'user_id',
        'company_name',
        'business_reg_no',
        'status',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}