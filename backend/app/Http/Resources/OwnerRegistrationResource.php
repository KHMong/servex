<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Carbon\Carbon;

class OwnerRegistrationResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'user_id' => $this->user_id,
            'owner_name' => $this->user->name,
            'company_name' => $this->company_name,
            'business_reg_no' => $this->business_reg_no,
            'date_submitted' => Carbon::parse($this->created_at, 'Asia/Kuala_Lumpur')->format('Y-m-d'),
            'status' => $this->status,
        ];
    }
}