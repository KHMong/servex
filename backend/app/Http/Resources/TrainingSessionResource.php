<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Carbon\Carbon;

class TrainingSessionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $start = Carbon::parse($this->start_datetime);
        $end = Carbon::parse($this->end_datetime);

        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'date_formatted' => $start->format('F j, Y'),
            'time_range' => $start->format('g:i A') . ' - ' . $end->format('g:i A'),
            'status' => $this->status,
        ];
    }
}