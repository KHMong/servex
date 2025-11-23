<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PlayerGroupResource extends JsonResource
{
    public function toArray(Request $request)
    {
        $group = $this->traineeGroup;
        $coachUser = $group->coach->user;

        return [
            'id' => $group->id,
            'name' => $group->name,
            'coach_name' => $coachUser->name,
            'coach_email' => $coachUser->email,
            'coach_phone' => $coachUser->phone_no,
        ];
    }
}