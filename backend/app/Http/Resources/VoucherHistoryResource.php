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
            'expiry_date' => $this->expiry_date->toFormattedDateString(),
            'status' => $this->status,
            // Relationships
            'user' => new UserResource($this->whenLoaded('user')),
            'voucher' => new VoucherResource($this->whenLoaded('voucher')),
            'booking' => new BookingResource($this->whenLoaded('booking')),
        ];
    }
}