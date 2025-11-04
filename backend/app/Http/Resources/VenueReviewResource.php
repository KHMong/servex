<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VenueReviewResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'rating' => $this->rating,
            'comment' => $this->comment,
            'posted_date' => optional($this->created_at)->format('F d, Y \a\t H:i A'),
            // Relationships
            'user' => new UserResource($this->whenLoaded('user')),
            'venue' => new VenueResource($this->whenLoaded('venue')),
        ];
    }
}