<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ActivityResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'fee' => $this->fee,
            'max_players' => $this->max_player,
            'status' => $this->status,
            // Relationships
            'creator' => new UserResource($this->whenLoaded('user')),
            'booking' => new BookingResource($this->whenLoaded('booking')),
            'skill_level' => new SkillLevelResource($this->whenLoaded('skillLevel')),
            'participants' => ActivityParticipantResource::collection($this->whenLoaded('participants')),
        ];
    }
}