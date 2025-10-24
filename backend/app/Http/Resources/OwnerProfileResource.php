<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OwnerProfileResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'user_id' => $this->user_id,
            'company_name' => $this->company_name,
            'business_reg_no' => $this->business_reg_no,
            'status' => $this->status,
        ];
    }
}