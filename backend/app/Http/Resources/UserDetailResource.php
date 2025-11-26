<?php
namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;
use Carbon\Carbon;

class UserDetailResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'name' => $this->name,
            'email' => $this->email,
            'phone_no' => $this->phone_no,
            'date_of_birth' => Carbon::parse($this->date_of_birth, 'Asia/Kuala_Lumpur')->format('Y-m-d'),
            'gender' => $this->gender,
            'date_joined' => Carbon::parse($this->created_at, 'Asia/Kuala_Lumpur')->format('Y-m-d'),
            'points' => $this->points,
            'photo_path' => $this->photo ? "users/{$this->id}/{$this->photo}" : null,
            
            'role' => $this->role,
            'is_coach' => (bool) $this->is_coach,
            'is_organiser' => (bool) $this->is_organiser,
            'status' => $this->status,

            'coach_profile' => $this->when($this->coachProfile, function () {
                return [
                    'bio' => $this->coachProfile->bio,
                    'exp_year' => $this->coachProfile->exp_year,
                    'state' => $this->coachProfile->state->name,
                    'status' => $this->coachProfile->status,
                    'cert_path' => $this->coachProfile->cert ? "certs/{$this->id}/{$this->coachProfile->cert}" : null,
                ];
            }),

            'owner_profile' => $this->when($this->ownerProfile, function () {
                return [
                    'company_name' => $this->ownerProfile->company_name,
                    'business_reg_no' => $this->ownerProfile->business_reg_no,
                    'status' => $this->ownerProfile->status,
                ];
            }),
        ];
    }
}