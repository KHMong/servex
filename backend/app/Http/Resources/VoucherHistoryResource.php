<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VoucherHistoryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'voucher' => [
                'code' => $this->voucher->code,
                'description' => $this->voucher->description,
                'discount_value' => number_format($this->voucher->discount_value, 2),
            ],
            'expiry_date' => $this->expiry_date->format('Y-m-d'),
            'expires_on' => $this->expiry_date->format('d M Y'),
            'status' => $this->status,
            // Relationships
            'user' => new UserResource($this->whenLoaded('user')),
            'booking_date' => $this->booking?->created_at?->setTimezone('Asia/Kuala_Lumpur')->format('d M Y'),
        ];
    }
}