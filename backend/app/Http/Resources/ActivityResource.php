<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Carbon\Carbon;

class ActivityResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $start = Carbon::parse($this->booking->start_datetime);
        $end = Carbon::parse($this->booking->end_datetime);

        return [
            'id' => $this->id,
            'fee' => number_format($this->fee, 2),
            'max_players' => $this->max_player,
            'status' => $this->status,

            // Relationships
            'creator' => new UserResource($this->whenLoaded('user')),
            'booking' => new BookingResource($this->whenLoaded('booking')),
            'participants' => ActivityParticipantResource::collection($this->whenLoaded('participants')),

            // Participant count
            'participants_count' => $this->participants_count,
            'is_full' => $this->participants_count >= $this->max_player,

            // Date and time 
            'date_formatted' => $start->format('F d, Y'),
            'date_short_month_year' => $start->format('M Y'),
            'date_day' => $start->format('d'),
            'date_day_name' => $start->format('D'),
            'time_range' => $start->format('h:i A') . ' - ' . $end->format('h:i A'),

            // Skill level
            'skill_level' => $this->whenLoaded('skillLevel', $this->skillLevel->name),

            // Host info
            'host' => [
                'name' => $this->whenLoaded('user', $this->user->name),
                'phone_no' => $this->whenLoaded('user', $this->user->phone_no),
                'photo_path' => $this->whenLoaded('user', function () {
                    if ($this->user->photo) {
                        // Path: "users/{user_id}/{filename}"
                        return "users/{$this->user->id}/{$this->user->photo}";
                    }
                    return null;
                }),
            ],

            // Venue info
            'venue' => [
                'name' => $this->whenLoaded('booking', $this->booking->court->venue->name),
                'state' => $this->whenLoaded('booking', $this->booking->court->venue->state->name),
                'address' => $this->whenLoaded('booking', $this->booking->court->venue->address),
            ],
        ];
    }
}