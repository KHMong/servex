<?php

namespace App\Http\Resources;

use Carbon\Carbon;
use Illuminate\Http\Resources\Json\JsonResource;

class OrganiserRegistrationResource extends JsonResource
{
    public function toArray($request)
    {
        $mainUser = [
            'name' => $this->user->name,
            'user_id' => $this->user->user_id,
            'photo_path' => $this->user->photo ? "users/{$this->user->id}/{$this->user->photo}" : null,
            'gender' => $this->user->gender,
            'dob' => Carbon::parse($this->user->date_of_birth)->format('d M Y'),
            'phone_no' => $this->user->phone_no
        ];

        $partnerUser = null;
        if ($this->partner) {
            $partnerUser = [
                'name' => $this->partner->name,
                'user_id' => $this->partner->user_id,
                'photo_url' => $this->partner->photo ? "users/{$this->partner->id}/{$this->partner->photo}" : null,
                'gender' => $this->partner->gender,
                'dob' => Carbon::parse($this->partner->date_of_birth)->format('d M Y'),
                'phone_no' => $this->partner->phone_no
            ];
        }

        return [
            'id' => $this->id,
            'main_participant' => $mainUser,
            'partner_participant' => $partnerUser,
            'category' => $this->category->name,
            'ec_phone_no' => $this->ec_phone_no,
            'payment_status' => $this->payment_status,
            'status' => $this->status,
        ];
    }
}