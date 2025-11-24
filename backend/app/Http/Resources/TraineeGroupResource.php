<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TraineeGroupResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'status' => $this->status,
            'active_trainees' => $this->active_members_count,
            'can_delete' => $this->scheduled_count === 0 && $this->active_members_count === 0, 
            // Relationships
            'coach' => new UserResource($this->whenLoaded('coach')),
            'members' => GroupMemberResource::collection($this->whenLoaded('members')),
            'sessions' => [
                'scheduled' => $this->scheduled_count,
                'completed' => $this->completed_count,
            ],
        ];
    }
}