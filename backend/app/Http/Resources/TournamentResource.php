<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TournamentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'photo' => $this->photo,
            'venue_address' => $this->venue_address,
            'start_date' => $this->start_date->toFormattedDateString(),
            'end_date' => $this->end_date->toFormattedDateString(),
            'registration_deadline' => $this->deadline->toFormattedDateString(),
            'description' => $this->description,
            'prize_pool' => $this->prize,
            'rules' => $this->rule,
            'results' => $this->result,
            'status' => $this->status,
            // Relationships
            'organiser' => new UserResource($this->whenLoaded('organiser')),
            'state' => new StateResource($this->whenLoaded('state')),
            'categories' => TournamentSelectedCategoryResource::collection($this->whenLoaded('selectedCategories')),
            'registrations' => TournamentRegistrationResource::collection($this->whenLoaded('registrations')),
            'photo_path' => $this->when($this->photo, function () {
                // Path: "tournaments/{venue_id}/{filename}"
                return "tournaments/{$this->id}/{$this->photo}";
            }, null), // If no photo, return null
        ];
    }
}