<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ActivityParticipantResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'participant_id' => $this->participant_id,
            'is_host' => $this->is_host,
            'name' => $this->name,
            'gender' => $this->gender,
            'phone_no' => $this->phone_no,
            'photo_path' => $this->when($this->photo, function() {
                // Path: "users/{user_id}/{filename}"
                return "users/{$this->id}/{$this->photo}";
            }, null), // If no photo, return null
        ];
    }
}