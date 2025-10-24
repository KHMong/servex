<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SessionAttendanceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'comment' => $this->comment,
            'status' => $this->status,
            // Relationships
            'member' => new GroupMemberResource($this->whenLoaded('groupMember')),
        ];
    }
}