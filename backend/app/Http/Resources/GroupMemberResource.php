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
            'name' => $this->trainee->name,
            'photo_path' => $this->when($this->trainee->photo, function () {
                // Path: "users/{user_id}/{filename}"
                return "users/{$this->trainee->id}/{$this->trainee->photo}";
            }, null), // If no photo, return null
            'gender' => $this->trainee->gender,
            'email' => $this->trainee->email,
            'phone_no' => $this->trainee->phone_no,
        ];
    }
}