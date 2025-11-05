<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Carbon\Carbon;

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
            'prize' => $this->prize,
            'rule' => $this->rule,
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

            'start_date_formatted' => Carbon::parse($this->start_date)->format('M d, Y'),
            'end_date_formatted' => Carbon::parse($this->end_date)->format('M d, Y'),
            'deadline_formatted' => Carbon::parse($this->deadline)->format('M d, Y'),
            'selected_categories' => $this->whenLoaded('selectedCategories', function () {
                return $this->selectedCategories->map(function ($selectedCategory) {
                    return [
                        'name' => $selectedCategory->category->name,
                        'fee' => number_format($selectedCategory->entry_fee, 2),
                    ];
                });
            }),
        ];
    }
}