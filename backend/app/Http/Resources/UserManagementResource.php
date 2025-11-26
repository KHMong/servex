<?php
namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;
use Carbon\Carbon;

class UserManagementResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'name' => $this->name,
            'email' => $this->email,
            'phone_no' => $this->phone_no,
            'role' => $this->role,
            'is_coach' => (bool) $this->is_coach,
            'is_organiser' => (bool) $this->is_organiser,
            'status' => $this->status,
            'joined_date' => Carbon::parse($this->created_at, 'Asia/Kuala_Lumpur')->format('Y-m-d'),
        ];
    }
}