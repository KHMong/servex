<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TrainingSessionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'start_datetime' => $this->start_datetime,
            'end_datetime' => $this->end_datetime,
            'status' => $this->status,
            // Relationships
            'attendance' => SessionAttendanceResource::collection($this->whenLoaded('attendances')),
        ];
    }
}