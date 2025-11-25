<?php
namespace App\Http\Controllers\Api\Owner;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Venue;
use App\Models\PricingRule;
use App\Http\Resources\OwnerVenueResource;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class OwnerVenueController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request)
    {
        $user = $request->user();
        $query = Venue::where('owner_id', $user->id);

        // Filter (Application status)
        if ($request->filled('apply_status')) {
            $query->where('apply_status', $request->apply_status);
        }

        // Filter (Status)
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Search filter (Name)
        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        $query->where('status', '!=', 'Terminated');

        $venues = $query->withCount(['courts' => function($q) {
            $q->where('status', '!=', 'Terminated');
        }])->latest()->paginate(10);

        return OwnerVenueResource::collection($venues);
    }

    public function applyVenue(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'state_id' => 'required|exists:state,id',
            'address' => 'required|string|max:2000',
            'opening_time' => 'required|date_format:H:i',
            'closing_time' => 'required|date_format:H:i',
            'phone_no' => 'required|regex:/^0[1-9]-[0-9]{8}$/',
            'weekday_price' => 'required|numeric|min:0|max:9999',
            'weekend_price' => 'required|numeric|min:0|max:9999',
            'photos.*' => 'image|mimes:jpeg,png,jpg|max:10240',
            'photos' => 'array|min:1|max:5',
        ]);

        $user = $request->user();

        return DB::transaction(function () use ($validated, $user, $request) {
            // Create Venue
            $venue = Venue::create([
                'owner_id' => $user->id,
                'state_id' => $validated['state_id'],
                'name' => $validated['name'],
                'address' => $validated['address'],
                'opening_time' => $validated['opening_time'],
                'closing_time' => $validated['closing_time'],
                'phone_no' => $validated['phone_no'],
                'apply_status' => 'Pending',
                'status' => 'Inactive',
            ]);

            // Create Pricing Rules
            PricingRule::create([
                'venue_id' => $venue->id,
                'day_type' => 'Weekday',
                'start_time' => $validated['opening_time'],
                'end_time' => $validated['closing_time'],
                'price' => $validated['weekday_price'],
            ]);
            PricingRule::create([
                'venue_id' => $venue->id,
                'day_type' => 'Weekend',
                'start_time' => $validated['opening_time'],
                'end_time' => $validated['closing_time'],
                'price' => $validated['weekend_price'],
            ]);

            // Handle Photos
            if ($request->hasFile('photos')) {
                foreach ($request->file('photos') as $photo) {
                    $path = $photo->store('uploads/venues/' . $venue->id);
                    $venue->photos()->create(['photo' => basename($path)]);
                }
            }

            return response()->json(['message' => 'Venue application submitted successfully.']);
        });
    }

    public function getVenueDetails(Venue $venue)
    {
        $this->authorize('view', $venue);
        
        // Load relationships
        $venue->load(['state', 'photos', 'pricingRules']);
        
        return new OwnerVenueResource($venue);
    }

    public function editVenueDetails(Request $request, Venue $venue)
    {
        $this->authorize('update', $venue);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'state_id' => 'required|exists:state,id',
            'address' => 'required|string|max:2000',
            'opening_time' => 'required|date_format:H:i',
            'closing_time' => 'required|date_format:H:i',
            'phone_no' => 'required|regex:/^0[1-9]-[0-9]{8}$/',
            'weekday_price' => 'required|numeric|min:0.01|max:9999',
            'weekend_price' => 'required|numeric|min:0.01|max:9999',
            'status' => 'required|in:Active,Inactive',
            'photos.*' => 'image|mimes:jpeg,png,jpg|max:10240',
            'deleted_photos' => 'array',
            'deleted_photos.*' => 'integer|exists:venue_photo,id',
        ]);

        return DB::transaction(function () use ($validated, $request, $venue) {
            // Photo Count
            $currentCount = $venue->photos()->count();
            $deleteCount = isset($validated['deleted_photos']) ? count($validated['deleted_photos']) : 0;
            $newCount = $request->hasFile('photos') ? count($request->file('photos')) : 0;

            if (($currentCount - $deleteCount + $newCount) < 1) {
                return response()->json(['message' => 'Please upload at least one venue photo.'], 422);
            }

            // Update Venue Details
            $venue->update([
                'state_id' => $validated['state_id'],
                'name' => $validated['name'],
                'address' => $validated['address'],
                'opening_time' => $validated['opening_time'],
                'closing_time' => $validated['closing_time'],
                'phone_no' => $validated['phone_no'],
                'status' => $validated['status'],
            ]);

            // Weekday Rule
            $venue->pricingRules()->updateOrCreate(
                ['day_type' => 'Weekday'],
                [
                    'start_time' => $validated['opening_time'],
                    'end_time' => $validated['closing_time'],
                    'price' => $validated['weekday_price']
                ]
            );

            // Weekend Rule
            $venue->pricingRules()->updateOrCreate(
                ['day_type' => 'Weekend'],
                [
                    'start_time' => $validated['opening_time'],
                    'end_time' => $validated['closing_time'],
                    'price' => $validated['weekend_price']
                ]
            );

            // Delete photos
            if (!empty($validated['deleted_photos'])) {
                $photosToDelete = $venue->photos()->whereIn('id', $validated['deleted_photos'])->get();
                
                foreach ($photosToDelete as $photo) {
                    // Delete file
                    $path = 'uploads/venues/' . $venue->id . '/' . $photo->photo;
                    if (Storage::exists($path)) {
                        Storage::delete($path);
                    }

                    // Delete record
                    $photo->delete();
                }
            }

            // Upload new photos
            if ($request->hasFile('photos')) {
                foreach ($request->file('photos') as $photo) {
                    $path = $photo->store('uploads/venues/' . $venue->id);
                    $venue->photos()->create(['photo' => basename($path)]);
                }
            }
            
            return response()->json(['message' => 'Venue updated successfully.']);
        });
    }

    public function cancelVenueApplication(Venue $venue)
    {
        $this->authorize('update', $venue);

        if ($venue->apply_status !== 'Pending') {
            return response()->json(['message' => 'You can only cancel Pending venue application.']);
        }

        $venue->update(['apply_status' => 'Cancelled']);

        return response()->json(['message' => 'Venue application cancelled successfully.']);
    }

    public function deleteVenue(Venue $venue)
    {
        $this->authorize('update', $venue);

        $venue->update(['status' => 'Terminated']);

        return response()->json(['message' => 'Venue deleted successfully.']);
    }
}