<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\Venue;
use Illuminate\Http\Request;
use App\Http\Resources\VenueResource;
use App\Http\Resources\VenueReviewResource;
use Carbon\Carbon;

class VenueController extends Controller
{
    public function index(Request $request)
    {
        $query = Venue::query()
            ->where('apply_status', 'Approved') // Approved
            ->where('status', 'Active') // Active

            // User account is active
            ->whereHas('owner', function ($q) {
                $q->where('status', 'Active');
            })

            // Owner profile is approved
            ->whereHas('owner.ownerProfile', function ($q) {
                $q->where('status', 'Approved');
            });    

        // Search filter
        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        // State filter
        if ($request->filled('state_id')) {
            $query->where('state_id', $request->state_id);
        }

        // Eager loading
        $venues = $query->with('state', 'coverPhoto')->latest()->paginate(12);

        return VenueResource::collection($venues);
    }

    public function getVenueDetails(Venue $venue) 
    {
        $venue->load('state', 'photos', 'pricingRules');
        return new VenueResource($venue);
    }

    public function getCourts(Venue $venue)
    {
        return $venue->courts()->where('status', 'Available')->get();
    }

    public function getReviews(Venue $venue)
    {
        $reviews = $venue->reviews()
                         ->where('status', 'Active')
                         ->with('user')->latest()->paginate(10);
        return VenueReviewResource::collection($reviews);
    }

    public function getAvailabilityByDate(Request $request, Venue $venue)
    {
        $validated = $request->validate([
            'date' => 'required|date_format:Y-m-d',
        ]);

        $selectedDate = Carbon::parse($validated['date']);
        $startOfDay = $selectedDate->copy()->startOfDay();
        $endOfDay = $selectedDate->copy()->endOfDay();

        // Fetch all active courts for the venue
        // Then fetch the bookings that overlap with the selected day
        $courtsWithBookings = $venue->courts()
            ->with(['bookings' => function ($query) use ($startOfDay, $endOfDay) {
                $query->where('start_datetime', '<', $endOfDay)
                    ->where('end_datetime', '>', $startOfDay)
                    ->where('status', '!=', 'Cancelled');
            }])
            ->get();

        return response()->json($courtsWithBookings);
    }
}