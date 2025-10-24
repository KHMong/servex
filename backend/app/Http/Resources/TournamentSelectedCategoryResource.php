<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TournamentSelectedCategoryResource extends JsonResource
{
public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'entry_fee' => $this->entry_fee,
            // Relationships
            'category_details' => new TournamentCategoryResource($this->whenLoaded('category')),
        ];
    }
}