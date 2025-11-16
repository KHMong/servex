<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\Tournament;
use Illuminate\Http\Request;
use App\Http\Resources\TournamentResource;
use Carbon\Carbon;

class TournamentController extends Controller
{
    public function index(Request $request)
    {
        $query = Tournament::query()
            ->where('status', 'Upcoming') // Upcoming

            // User account is active
            ->whereHas('organiser', function ($q) {
                $q->where('status', 'Active');
            }); 

        // Search filter
        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        // State filter
        if ($request->filled('state_id')) {
            $query->where('state_id', $request->state_id);
        }

        // Date filter
        if ($request->filled('date')) {
            $selectedDate = Carbon::parse($request->date);
            $query->where('start_date', '<=', $selectedDate)
                  ->where('end_date', '>=', $selectedDate);
        }

        // Eager loading
        $tournaments = $query->with('state')->latest()->paginate(12);

        return TournamentResource::collection($tournaments);
    }

    public function getTournamentDetails(Tournament $tournament) 
    {
        $tournament->load(['state', 'selectedCategories.category', 'organiser']);

        return new TournamentResource($tournament);
    }
}