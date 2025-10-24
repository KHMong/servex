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
            // Relationships
            'coach' => new UserResource($this->whenLoaded('coach')),
            'members' => GroupMemberResource::collection($this->whenLoaded('members')),
            'sessions' => TrainingSessionResource::collection($this->whenLoaded('trainingSessions')),
        ];
    }
}