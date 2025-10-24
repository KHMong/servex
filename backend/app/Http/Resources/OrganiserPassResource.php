<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrganiserPassResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'user_id' => $this->user_id,
            'amount' => $this->amount,
            'purchase_date' => $this->purchase_date->toFormattedDateString(),
        ];
    }
}