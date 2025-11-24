<?php
namespace App\Http\Controllers\Api\Organiser;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Tournament;
use App\Models\State;
use App\Models\TournamentCategory;
use App\Models\TournamentRegistration;
use App\Http\Resources\TournamentResource;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class OrganiserTournamentController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request)
    {
        $user = $request->user();
        $query = Tournament::where('organiser_id', $user->id)
            ->withCount([
                'registrations as approved_count' => function ($q) { $q->where('status', 'Approved'); },
                'registrations as pending_count' => function ($q) { $q->where('status', 'Pending'); }
            ]);

        // Search filter (Name)
        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        // Status filter
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $tournaments = $query->orderBy('start_date', 'desc')->paginate(10);

        return TournamentResource::collection($tournaments);
    }

    public function getCreateInfo()
    {
        return response()->json([
            'states' => State::all(),
            'tournament_categories' => TournamentCategory::all(),
        ]);
    }

    public function getTournamentDetails(Tournament $tournament)
    {
        $this->authorize('view', $tournament);
        
        $tournament->load('selectedCategories.category');

        $isUpcoming = $tournament->status === 'Upcoming';
        
        return response()->json([
            'can_edit' => $isUpcoming,
            'status' => $tournament->status,
            // Create associative array here to prevent over formatting in resource
            'form_data' => [
                'name' => $tournament->name,
                'venue_address' => $tournament->venue_address,
                'state_id' => $tournament->state_id,
                'start_date' => $tournament->start_date,
                'end_date' => $tournament->end_date,
                'deadline' => $tournament->deadline,
                'description' => $tournament->description,
                'prize' => $tournament->prize,
                'rule' => $tournament->rule,
                'photo_path' => $tournament->photo ? "tournaments/{$tournament->id}/{$tournament->photo}" : null,
                'selected_categories' => $tournament->selectedCategories->map(function($item) use ($tournament) {
                    // Check if there is any Pending/Approved registrations for the category
                    $hasRegistrations = TournamentRegistration::where('tournament_id', $tournament->id)
                        ->where('category_id', $item->category_id)
                        ->whereIn('status', ['Pending', 'Approved']) // Active registrations
                        ->exists();

                    return [
                        'id' => $item->category_id,
                        'name' => $item->category->name,
                        'fee' => $item->entry_fee,
                        'can_remove' => !$hasRegistrations
                    ];
                }),
            ]
        ]);
    }

    public function createTournament(Request $request)
    {
        $validated = $this->validateTournament($request);

        DB::transaction(function () use ($request, $validated) {
            $tournament = Tournament::create([
                'organiser_id' => $request->user()->id,
                'state_id' => $validated['state_id'],
                'name' => $validated['name'],
                'photo' => '',
                'venue_address' => $validated['venue_address'],
                'start_date' => $validated['start_date'],
                'end_date' => $validated['end_date'],
                'deadline' => $validated['deadline'],
                'description' => $validated['description'],
                'prize' => $validated['prize'],
                'rule' => $validated['rule'],
                'status' => 'Upcoming',
            ]);

            if ($request->hasFile('photo')) {
                $path = $request->file('photo')->store('uploads/tournaments/' . $tournament->id);
                $tournament->update(['photo' => basename($path)]);
            }

            // Save Tournament Selected Categories
            if ($request->has('categories')) {
                foreach ($request->categories as $cat) {
                    $tournament->selectedCategories()->create([
                        'category_id' => $cat['category_id'],
                        'entry_fee' => $cat['entry_fee']
                    ]);
                }
            }
        });

        return response()->json(['message' => 'Tournament created successfully!'], 201);
    }

    public function editTournamentDetails(Request $request, Tournament $tournament)
    {
        $this->authorize('update', $tournament);

        $validated = $this->validateTournament($request);

        DB::transaction(function () use ($request, $validated, $tournament) {
            $oldPhotoPath = null;

            // Check if new photo uploaded
            if ($request->hasFile('photo')) {
                // Check if old photo exists
                if ($tournament->photo) {
                    $oldPhotoPath = "uploads/tournaments/{$tournament->id}/{$tournament->photo}";
                }

                // Store new photo
                $path = $request->file('photo')->store('uploads/tournaments/' . $tournament->id);
                $validated['photo'] = basename($path);
            } else { // No photo uploaded, remove from update
                unset($validated['photo']); 
            }

            // Update tournament record
            $tournament->update($validated);

            if ($oldPhotoPath) {
                Storage::disk('local')->delete($oldPhotoPath);
            }

            // Get existing category IDs
            $existingCatIds = $tournament->selectedCategories()->pluck('category_id')->toArray();

            // Get submitted category IDs
            $submittedCatIds = collect($request->categories)->pluck('category_id')->toArray();

            // Check if there is any removed IDs relating to existing one
            $idsToDelete = array_diff($existingCatIds, $submittedCatIds);

            // Validation
            foreach ($idsToDelete as $catId) {
                $hasRegistrations = TournamentRegistration::where('tournament_id', $tournament->id)
                    ->where('category_id', $catId)
                    ->whereIn('status', ['Pending', 'Approved'])
                    ->exists();

                if ($hasRegistrations) {
                    return response()->json(['message' => 'Cannot remove a category that has active registrations.']);
                }

                // Delete categories
                $tournament->selectedCategories()->where('category_id', $catId)->delete();
            }

            // Update/Create remaining categories
            foreach ($request->categories as $cat) {
                $tournament->selectedCategories()->updateOrCreate(
                    ['category_id' => $cat['category_id']],
                    ['entry_fee' => $cat['entry_fee']]
                );
            }
        });

        return response()->json(['message' => 'Tournament updated successfully!']);
    }

    public function cancelTournament(Tournament $tournament)
    {
        $this->authorize('update', $tournament);

        if ($tournament->status !== 'Upcoming') {
            return response()->json(['message' => 'You can only cancel an upcoming tournament.'], 422);
        }

        $tournament->update(['status' => 'Cancelled']);
        return response()->json(['message' => 'Tournament cancelled successfully.']);
    }

    // Validation rules
    private function validateTournament($request)
    {
        return $request->validate([
            'state_id' => 'required|exists:state,id',
            'name' => 'required|string|max:255',
            'photo' => 'nullable|image|mimes:jpeg,png,jpg|max:10240',
            'venue_address' => 'required|string|max:2000',
            'start_date' => 'required|date|after:today',
            'end_date' => 'required|date|after_or_equal:start_date',
            'deadline' => 'required|date|before:start_date|after:today',
            'description' => 'required|string|max:50000',
            'prize' => 'required|string|max:50000',
            'rule' => 'required|string|max:50000',
            'categories' => 'required|array|min:1',
            'categories.*.category_id' => 'required|exists:tournament_category,id',
            'categories.*.entry_fee' => 'required|numeric|min:0|max:9999',
        ]);
    }
}