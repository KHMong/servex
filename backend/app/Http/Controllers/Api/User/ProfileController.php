<?php
namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Http\Resources\UserResource;
use Illuminate\Validation\Rule;
use Carbon\Carbon;

class ProfileController extends Controller
{
    // Get the current user's profile
    public function getUserProfile(Request $request)
    {
        $user = $request->user();
        $user->loadMissing('ownerProfile');
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

        if ($request->hasFile('photo')) {
            $path = $request->file('photo')->store('uploads/users/' . $user->id);
            $validated['photo'] = basename($path);
        }

        $user->update($validated);

        return new UserResource($user);
    }
}