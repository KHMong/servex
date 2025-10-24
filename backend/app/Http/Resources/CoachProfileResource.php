<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CoachProfileResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'user_id' => $this->user_id,
            'bio' => $this->bio,
            'experience_years' => $this->exp_year,
            'certificate_url' => $this->cert,
            'status' => $this->status,
            // Relationships
            'state' => new StateResource($this->whenLoaded('state')),
        ];
    }
}