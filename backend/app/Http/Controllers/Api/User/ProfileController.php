<?php
namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use App\Http\Resources\UserResource;
use App\Http\Resources\CoachProfileResource;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\Rule;
use Carbon\Carbon;

class ProfileController extends Controller
{
    // Get the current user's profile
    public function getUserProfile(Request $request)
    {
        $user = $request->user();
        $user->loadMissing(['ownerProfile', 'coachProfile']);
        return new UserResource($user);
    }

    // Update the current user's profile
    public function updateUserProfile(Request $request)
    {
        $user = $request->user();

        // Player: >= 7 y/0, Admin/Owner: >= 15 y/o
        $minAge = ($user->role === 'Player') ? 7 : 15;
        $cutoffDate = Carbon::now()->subYears($minAge)->format('Y-m-d');

        $playerPhoneRegex = '/^01[0-9]-[0-9]{7,8}$/';
        $ownerPhoneRegex = '/^0[1-9]-[0-9]{8}$/';
        $phoneRegex = $user->role === 'Owner' ? $ownerPhoneRegex : $playerPhoneRegex;

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'gender' => 'required|in:M,F',
            'date_of_birth' => [
                'required',
                'date',
                'before_or_equal:' . $cutoffDate,
            ],
            'email' => [
                'required',
                'email',
                Rule::unique('user')->ignore($user->id),
            ],
            'phone_no' => [
                'required', 
                'string', 
                'regex:' . $phoneRegex,
                Rule::unique('user')->ignore($user->id),
            ],
            'photo' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
        ]);

        if ($user->role === 'Admin' && $user->email !== $validated['email']) {
            return response()->json(['message' => 'Admin cannot change email address.'], 403);
        }

        // Start a transaction
        DB::transaction(function () use ($request, $user, $validated) {
            $oldPhotoPath = null;

            // Check if new photo uploaded and old photo exists
            if ($request->hasFile('photo') && $user->photo) {
                $oldPhotoPath = "uploads/users/{$user->id}/{$user->photo}";
            }
            
            // Store new photo if uploaded
            if ($request->hasFile('photo')) {
                $path = $request->file('photo')->store('uploads/users/' . $user->id);
                $validated['photo'] = basename($path);
            }
            
            // Update user record
            $user->update($validated);

            if ($oldPhotoPath) {
                Storage::disk('local')->delete($oldPhotoPath);
            }
        });

        $user->refresh();

        return new UserResource($user);
    }

    public function getCoachProfile(Request $request)
    {
        $coachProfile = $request->user()->coachProfile()->firstOrFail();
        return new CoachProfileResource($coachProfile);
    }

    public function updateCoachProfile(Request $request)
    {
        $user = $request->user();
        $coachProfile = $user->coachProfile()->firstOrFail();

        $validated = $request->validate([
            'state_id' => 'required|exists:state,id',
            'exp_year' => 'required|integer|min:0|max:99',
            'bio' => 'required|string|max:2000',
            'cert' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:10240',
        ]);

        // Start a transaction
        DB::transaction(function () use ($request, $user, $coachProfile, $validated) {
            $oldCertPath = null;

            // Check if new cert uploaded and old cert exists
            if ($request->hasFile('cert') && $coachProfile->cert) {
                $oldCertPath = "uploads/certs/{$user->id}/{$coachProfile->cert}";
            }
            
            // Store new cert if uploaded
            if ($request->hasFile('cert')) {
                $path = $request->file('cert')->store('uploads/certs/' . $user->id);
                $validated['cert'] = basename($path);
            }
            
            // Update coach profile record
            $coachProfile->update($validated);

            if ($oldCertPath) {
                Storage::disk('local')->delete($oldCertPath);
            }
        });

        $coachProfile->refresh();

        return new CoachProfileResource($coachProfile);
    }

    public function changePassword(Request $request) 
    {
        $user = $request->user();

        $validated = $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => [
                'required',
                'string', 
                'confirmed', 
                'different:current_password', 
                Password::min(8)
                        ->max(15) 
                        ->mixedCase()
                        ->numbers()
                        ->symbols(),
            ]
        ]);

        $user->update([
            'password' => Hash::make($validated['password']),
        ]);

        $user->refresh();

        return response()->json(['message' => 'Password updated successfully.'], 200);
    }

    public function applyForCoach(Request $request)
    {
        $user = $request->user();

        $oldCertPath = null;
        $existingProfile = $user->coachProfile;

        // Check if old cert exists
        if ($existingProfile && $existingProfile->cert) {
            $oldCertPath = 'uploads/certs/' . $user->id . '/' . $existingProfile->cert;
        }
        
        // Pending or Approved Application
        if ($existingProfile && in_array($existingProfile->status, ['Pending', 'Approved'])) {
            return response()->json(['message' => 'You already have a pending or approved application.'], 409);
        }

        $validated = $request->validate([
            'state_id' => 'required|exists:state,id',
            'exp_year' => 'required|integer|min:0|max:99',
            'bio' => 'required|string|max:2000',
            'cert' => 'required|file|mimes:pdf,jpg,jpeg,png|max:10240',
        ]);

        $newFilePath = $request->file('cert')->store('uploads/certs/' . $user->id);

        $coachProfile = $user->coachProfile()->updateOrCreate(
            ['user_id' => $user->id], // Find by user_id
            [
                'state_id' => $validated['state_id'],
                'exp_year' => $validated['exp_year'],
                'bio' => $validated['bio'],
                'cert' => basename($newFilePath),
                'status' => 'Pending',
            ]
        );

        if ($oldCertPath && Storage::exists($oldCertPath)) {
            Storage::delete($oldCertPath);
        }

        return response()->json([
            'message' => 'Your coach application has been submitted successfully!',
            'coach_profile' => new CoachProfileResource($coachProfile),
        ], 201);
    }
}