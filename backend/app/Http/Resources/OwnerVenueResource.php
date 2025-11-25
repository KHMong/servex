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
            'state_id' => $this->state_id,
            'total_courts' => $this->whenCounted('courts'),
            'apply_status' => $this->apply_status,
            'status' => $this->status,

            'address' => $this->address,
            'opening_time' => $this->opening_time,
            'closing_time' => $this->closing_time,
            'phone_no' => $this->phone_no,

            'weekday_price' => $this->whenLoaded('pricingRules', function () {
                $rule = $this->pricingRules->where('day_type', 'Weekday')->first();
                return $rule ? $rule->price : 0;
            }),

            'weekend_price' => $this->whenLoaded('pricingRules', function () {
                $rule = $this->pricingRules->where('day_type', 'Weekend')->first();
                return $rule ? $rule->price : 0;
            }),

            'photos' => $this->whenLoaded('photos', function () {
                return $this->photos->map(function ($photo) {
                    return [
                        'id' => $photo->id,
                        'path' => "venues/{$this->id}/{$photo->photo}"
                    ];
                });
            }),
        ];
    }
}