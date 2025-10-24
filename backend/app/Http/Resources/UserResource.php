<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'name' => $this->name,
            'gender' => $this->gender,
            'date_of_birth' => $this->date_of_birth->toFormattedDateString(),
            'email' => $this->email,
            'phone_no' => $this->phone_no,
            'photo' => $this->photo,
            'role' => $this->role,
            'is_coach' => $this->is_coach,
            'is_organiser' => $this->is_organiser,
            'points' => $this->points,
            'status' => $this->status,
            'joined_at' => $this->created_at->toFormattedDateString(),
            // Relationships
            'owner_profile' => new OwnerProfileResource($this->whenLoaded('ownerProfile')),
            'coach_profile' => new CoachProfileResource($this->whenLoaded('coachProfile')),
        ];
    }
}