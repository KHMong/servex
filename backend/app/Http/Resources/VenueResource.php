<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VenueResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'address' => $this->address,
            'opening_time' => $this->opening_time,
            'closing_time' => $this->closing_time,
            'phone_no' => $this->phone_no,
            'apply_status' => $this->apply_status,
            'status' => $this->status,
            // Relationships
            'owner' => new UserResource($this->whenLoaded('owner')),
            'state' => new StateResource($this->whenLoaded('state')),
            'photos' => VenuePhotoResource::collection($this->whenLoaded('photos')),
            'courts' => CourtResource::collection($this->whenLoaded('courts')),
            'reviews' => VenueReviewResource::collection($this->whenLoaded('reviews')),
            'pricing_rules' => PricingRuleResource::collection($this->whenLoaded('pricingRules')),
            'cover_photo_path' => $this->whenLoaded('coverPhoto', function () {
                if ($this->coverPhoto) {
                    // Path: "venues/{venue_id}/{filename}"
                    return "venues/{$this->id}/{$this->coverPhoto->photo}";
                }

                return null;
            }),
        ];
    }
}