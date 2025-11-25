<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OwnerVenueResource extends JsonResource
{
    public function toArray(Request $request)
    {
        return [
        'id' => $this->id,
        'name' => $this->name,
        'state' => $this->state->name,
        'total_courts' => $this->courts_count,
        'apply_status' => $this->apply_status,
        'status' => $this->status,
    ];
    }
}