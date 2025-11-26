<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VenueApplicationDetailResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,

            // Venue Details
            'name' => $this->name,
            'address' => $this->address,
            'state' => $this->state->name,
            'operating_hours' => $this->opening_time . ' - ' . $this->closing_time,
            'phone_no' => $this->phone_no,
            'apply_status' => $this->apply_status,
            'status' => $this->status,
            
            // Owner Details
            'owner' => [
                'id' => $this->owner->id,
                'name' => $this->owner->name,
                'company_name' => $this->owner->ownerProfile->company_name,
                'business_reg_no' => $this->owner->ownerProfile->business_reg_no,
            ],

            // Venue Photos
            'photos' => $this->photos->map(function($photo) {
                return "venues/{$this->id}/{$photo->photo}";
            }),
        ];
    }
}