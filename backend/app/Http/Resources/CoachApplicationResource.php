<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Carbon\Carbon;

class CoachApplicationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'user_id' => $this->user_id,
            'coach_name' => $this->user->name,
            'state' => $this->state->name,
            'exp_year' => $this->exp_year,
            'date_submitted' => Carbon::parse($this->created_at, 'Asia/Kuala_Lumpur')->format('Y-m-d'),
            'status' => $this->status,
            'cert_path' => $this->cert ? "certs/{$this->user_id}/{$this->cert}" : null,
        ];
    }
}