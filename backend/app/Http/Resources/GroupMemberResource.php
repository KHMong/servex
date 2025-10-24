<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GroupMemberResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'status' => $this->status,
            'joined_at' => $this->created_at,
            // Relationships
            'trainee' => new UserResource($this->whenLoaded('trainee')),
        ];
    }
}