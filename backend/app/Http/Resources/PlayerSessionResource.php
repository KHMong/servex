<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Http\Resources\Json\JsonResource;

class PlayerSessionResource extends JsonResource
{
    public function toArray(Request $request)
    {
        $session = $this->trainingSession;
        $group = $session->traineeGroup;
        $coach = $group->coach->user;
        $start = Carbon::parse($session->start_datetime);
        $end = Carbon::parse($session->end_datetime);

        return [
            'id' => $session->id,
            'session_name' => $session->name,
            'session_description' => $session->description,
            'group_name' => $group->name,
            'coach_name' => $coach->name,
            
            'date_day' => $start->format('l'),
            'date_full' => $start->format('d M Y'),
            'time_range' => $start->format('g:i A') . ' - ' . $end->format('g:i A'),
            
            'attendance_status' => $this->status,
        ];
    }
}