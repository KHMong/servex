<?php
namespace App\Http\Controllers\Api\Player;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\VenueReview;
use App\Http\Resources\VenueReviewResource;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class VenueReviewController extends Controller
{
    use AuthorizesRequests;

    public function submitReview(Request $request, VenueReview $review)
    {
        if ($request->user()->role !== 'Player') {
            return response()->json(['message' => 'You are not authorized to submit a review.'], 409);
        }

        $validated = $request->validate([
            'venue_id' => 'required|exists:venue,id',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'required|string|max:2000',
        ]);

        // Check if the user has already reviewed this venue
        $existingReview = VenueReview::where('user_id', $request->user()->id)
            ->where('venue_id', $validated['venue_id'])
            ->exists();

        if ($existingReview) {
            return response()->json(['message' => 'You have already reviewed this venue.'], 409);
        }

        $review = VenueReview::create([
            'user_id' => $request->user()->id,
            'venue_id' => $validated['venue_id'],
            'rating' => $validated['rating'],
            'comment' => $validated['comment'],
            'status' => 'Active',
        ]);

        return new VenueReviewResource($review);
    }

    public function getReview(VenueReview $review) 
    {
        $this->authorize('view', $review);

        if ($review->status !== 'Active') {
            return response()->json(['message' => 'Invalid venue review.'], 400);
        }

        return new VenueReviewResource($review);
    }

    public function editReview(Request $request, VenueReview $review)
    {
        $this->authorize('update', $review);

        $validated = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'required|string|max:2000',
        ]);

        $review->update($validated);

        $review->refresh();

        return new VenueReviewResource($review);
    }
}