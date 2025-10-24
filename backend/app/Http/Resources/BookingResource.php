<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BookingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'booking_id' => $this->booking_id,
            'start_datetime' => $this->start_datetime,
            'end_datetime' => $this->end_datetime,
            'total_price' => $this->total_price,
            'payment_status' => $this->payment_status,
            'status' => $this->status,
            'created_at' => $this->created_at,
            // Relationships
            'user' => new UserResource($this->whenLoaded('user')),
            'court' => new CourtResource($this->whenLoaded('court')),
            'activity' => new ActivityResource($this->whenLoaded('activity')),
        ];
    }
}