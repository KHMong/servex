<?php
namespace App\Http\Controllers\Api\Player;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Tournament;
use App\Models\User;
use App\Models\TournamentRegistration;

class TournamentRegistrationController extends Controller
{
    public function getForm(Tournament $tournament)
    {
        // Category names
        $categories = $tournament->selectedCategories()->with('category')->get();

        return response()->json([
            'tournament_name' => $tournament->name,
            'categories' => $categories->map(function ($selectedCategory) {
                return [
                    'id' => $selectedCategory->id,
                    'name' => $selectedCategory->category->name,
                ];
            }),
        ]);
    }

    public function register(Request $request, Tournament $tournament)
    {
        $user = $request->user();

        $validated = $request->validate([
            'category_id' => 'required|exists:tournament_selected_category,id',
            'partner_id' => ['nullable', 'string', 'regex:/^P\d{10}$/'],
            'ec_phone_no' => ['required', 'string', 'regex:/^01[0-9]-[0-9]{7,8}$/'],
        ]);
        
        // --- Validation ---
        $selectedCategory = $tournament->selectedCategories()->with('category')->find($validated['category_id']);
        $categoryName = $selectedCategory->category->name;
        $partner = null;

        // 1. Check for duplicate registration
        if (TournamentRegistration::where('user_id', $user->id)
                                    ->where('tournament_id', $tournament->id)
                                    ->where(function ($query) use ($user) {
                                        $query->where('user_id', $user->id)
                                            ->orWhere('partner_id', $user->id);
                                    })
                                    ->whereNotIn('status', ['Rejected', 'Cancelled'])->exists()) {
            return response()->json(['message' => 'You have already registered for this tournament.'], 422);
        }

        // 2. Partner validation for doubles
        if (str_contains($categoryName, 'Doubles')) {
            // Must have Partner's Player ID
            if (empty($validated['partner_id'])) {
                return response()->json(['message' => "Partner's Player Id is required."], 422);
            }

            // Partner ID cannot be ownself
            if ($validated['partner_id'] == $user->user_id) {
                return response()->json(['message' => 'You cannot be your own partner.'], 422);
            }

            // Find partner
            $partner = User::where('user_id', $validated['partner_id'])->where('role', 'Player')->where('status', 'Active')->first();

            // Partner does not exists
            if (!$partner) {
                return response()->json(['message' => "The Partner's Player Id is invalid or the player is not Active."], 422);
            }

            // Partner already register
            if (TournamentRegistration::where('user_id', $partner->id)
                                        ->where('tournament_id', $tournament->id)
                                        ->where(function ($query) use ($partner) {
                                            $query->where('user_id', $partner->id)
                                                ->orWhere('partner_id', $partner->id);
                                        })
                                        ->whereNotIn('status', ['Rejected', 'Cancelled'])->exists()) {
                return response()->json(['message' => 'Your partner has already registered for this tournament.'], 422);
            }

            // Gender validation for doubles
            if ($categoryName === "Men's Doubles" && ($user->gender !== 'M' || $partner->gender !== 'M')) {
                return response()->json(['message' => "Both players must be male for Men's Doubles."], 422);
            }
            if ($categoryName === "Women's Doubles" && ($user->gender !== 'F' || $partner->gender !== 'F')) {
                return response()->json(['message' => "Both players must be female for Women's Doubles."], 422);
            }
            if ($categoryName === "Mixed Doubles" && $user->gender === $partner->gender) {
                return response()->json(['message' => 'Players must be of different genders for Mixed Doubles.'], 422);
            }
        }

        // Create registration record
        TournamentRegistration::create([
            'user_id' => $user->id,
            'partner_id' => $partner ? $partner->id : null,
            'tournament_id' => $tournament->id,
            'category_id' => $selectedCategory->category_id,
            'ec_phone_no' => $validated['ec_phone_no'],
            'payment_status' => 'Unpaid',
            'status' => 'Pending',
        ]);

        return response()->json([
            'message' => 'Registration submitted successfully.',
        ], 201);
    }
}