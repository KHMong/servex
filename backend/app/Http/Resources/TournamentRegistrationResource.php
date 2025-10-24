<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TournamentRegistrationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'emergency_contact' => $this->ec_phone_no,
            'payment_status' => $this->payment_status,
            'status' => $this->status,
            // Relationships
            'user' => new UserResource($this->whenLoaded('user')),
            'partner' => new UserResource($this->whenLoaded('partner')),
            'tournament' => new TournamentResource($this->whenLoaded('tournament')),
            'category' => new TournamentCategoryResource($this->whenLoaded('category')),
        ];
    }
}