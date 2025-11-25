<?php
namespace App\Http\Controllers\Api\Owner;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Venue;
use App\Http\Resources\VenueReviewResource;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class OwnerVenueReviewController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request, Venue $venue)
    {
        $this->authorize('view', $venue);

        $query = $venue->reviews()->with('user');

        // Filter (Rating)
        if ($request->filled('rating') && $request->rating !== 'All') {
            $query->where('rating', $request->rating);
        }

        // Sorting
        $sort = $request->input('sort', 'Latest');
        if ($sort === 'Oldest') {
            $query->orderBy('created_at', 'asc');
        } else {
            $query->orderBy('created_at', 'desc');
        }

        $reviews = $query->paginate(15);

        // Stats
        $stats = [
            'average_rating' => round($venue->reviews()->avg('rating'), 1),
            'total_reviews' => $venue->reviews()->count(),
        ];

        return VenueReviewResource::collection($reviews)->additional([
            'venue_name' => $venue->name,
            'stats' => $stats
        ]);
    }
}