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
            'created_at' => $this->created_at->diffForHumans(),
            // Relationships
            'user' => new UserResource($this->whenLoaded('user')),
            'venue' => new VenueResource($this->whenLoaded('venue')),
        ];
    }
}