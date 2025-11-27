<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VoucherManagementResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'code' => $this->code,
            'description' => $this->description,
            'discount_value' => number_format($this->discount_value, 2),
            'point_cost' => $this->point_cost,
            'validity' => $this->validity,
            'status' => $this->status,
        ];
    }
}