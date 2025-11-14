<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Carbon\Carbon;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'name' => $this->name,
            'gender' => $this->gender,
            'date_of_birth' => $this->date_of_birth,
            'dob_for_input' => $this->when($this->date_of_birth, function() {
                return Carbon::parse($this->date_of_birth)->format('Y-m-d');
            }),
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
            'owner_profile' => $this->whenLoaded('ownerProfile', function () {
                return [
                    'company_name' => $this->ownerProfile->company_name,
                    'business_reg_no' => $this->ownerProfile->business_reg_no,
                ];
            }),
            'coach_profile' => $this->whenLoaded('coachProfile', function () {
                return [
                    'status' => $this->coachProfile->status,
                ];
            }),
            'photo_path' => $this->when($this->photo, function () {
                // Path: "users/{user_id}/{filename}"
                return "users/{$this->id}/{$this->photo}";
            }, null), // If no photo, return null
        ];
    }
}