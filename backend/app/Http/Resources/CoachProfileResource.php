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
            'exp_year' => $this->exp_year,
            'cert' => $this->cert,
            'status' => $this->status,
            // Relationships
            'name' => $this->whenLoaded('user', $this->user->name),
            'state' => new StateResource($this->whenLoaded('state')),
            'photo_path' => $this->whenLoaded('user', function () {
                if ($this->user->photo) {
                    // Path: "users/{user_id}/{filename}"
                    return "users/{$this->user->id}/{$this->user->photo}";
                }
            }, null), // If no photo, return null
        ];
    }
}