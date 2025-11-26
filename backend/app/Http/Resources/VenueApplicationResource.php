<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Carbon\Carbon;

class VenueApplicationResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'venue_name' => $this->name,
            'owner_name' => $this->owner->name,
            'company_name' => $this->owner->ownerProfile->company_name ?? 'N/A',
            'date_submitted' => Carbon::parse($this->created_at, 'Asia/Kuala_Lumpur')->format('Y-m-d'),
            'apply_status' => $this->apply_status,
        ];
    }
}