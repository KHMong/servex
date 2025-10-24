<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\Venue;
use App\Models\Tournament;
use App\Http\Resources\VenueResource;
use App\Http\Resources\TournamentResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class HomeController extends Controller
{
    public function getFeaturedVenues()
    {
        // Get the 4 most recently created, approved and active venues
        $venues = Venue::where([
            'apply_status' => 'Approved', 
            'status' => 'Active'
        ])
        ->with('state', 'coverPhoto')
        ->latest()
        ->limit(4)
        ->get();
        
        return VenueResource::collection($venues);
    }

    public function getUpcomingTournaments()
    {
        // Get the 4 upcoming tournament after today
        $tournaments = Tournament::where([
            'status' => 'Upcoming',   
        ])
        ->where('start_date', '>=', now())
        ->orderBy('start_date', 'asc')
        ->limit(4)
        ->get();
                                          
        return TournamentResource::collection($tournaments);
    }
}