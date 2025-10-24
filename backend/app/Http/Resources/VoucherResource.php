<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VoucherResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'code' => $this->code,
            'description' => $this->description,
            'discount_value' => $this->discount_value,
            'point_cost' => $this->point_cost,
            'validity_days' => $this->validity,
            'status' => $this->status,
        ];
    }
}