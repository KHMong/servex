<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Carbon\Carbon;

class TournamentRegistrationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $currentUser = $request->user();

        $mainPlayer = $this->whenLoaded('user');
        $partnerPlayer = $this->whenLoaded('partner');

        $partnerToDisplay = ($currentUser && $currentUser->id === $this->user_id) ? $partnerPlayer : $mainPlayer;

        return [
            'id' => $this->id,
            'ec_phone_no' => $this->ec_phone_no,
            'category_name' => $this->category->name,
            'payment_status' => $this->payment_status,
            'status' => $this->status,
            // Relationships
            'partner' => $partnerToDisplay ? [
                'user_id' => $partnerToDisplay->user_id,
                'name' => $partnerToDisplay->name,
            ] : null,
            'tournament' => [
                'id' => $this->tournament->id,
                'name' => $this->tournament->name,
                'start_date_formatted' => Carbon::parse($this->tournament->start_date)->format('M d, Y'),
                'venue_address' => $this->tournament->venue_address,
                'result_path' => $this->when($this->tournament->result, function() {
                    // Path: "tournaments/{id}/result/{filename}"
                    return "tournaments/{$this->tournament->id}/result/{$this->tournament->result}";
                }, null), // If no result, return null
            ],
            'can_cancel' => $currentUser && $currentUser->id === $this->user_id,
        ];
    }
}