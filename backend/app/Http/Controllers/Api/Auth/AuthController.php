<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use App\Models\OwnerProfile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use App\Http\Resources\UserResource;
use Illuminate\Validation\Rules\Password;

/*

PASSWORD REQUIREMENTS:
1. 8-15 characters
2. Must have uppercase and lowercase letters
3. Must have at least one number
4. Must have at least one special character

*/

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (!Auth::attempt($credentials)) {
            return response()->json([
                'message' => 'Invalid login credentials, please try again.'
            ], 401); // 401 Unauthorised
        }

        $user = $request->user();
        // Create new token for the user
        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'user' => new UserResource($user),
            'token' => $token,
        ]);
    }

    public function registerPlayer(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'gender' => 'required|in:Male,Female',
            'date_of_birth' => 'required|date',
            'email' => 'required|string|email|max:255|unique:users',
            'phone_no' => ['required|unique:users', 'string', 'regex:/^01[0-9]-[0-9]{7,8}$/'],
            'password' => [
                'required',
                'string',
                'confirmed',
                Password::min(8)
                        ->max(15) 
                        ->mixedCase()
                        ->numbers()
                        ->symbols(),
            ],
            'photo' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'gender' => $validated['gender'],
            'date_of_birth' => $validated['date_of_birth'],
            'phone_no' => $validated['phone_no'],
            'role' => 'Player',
        ]);

        if ($request->hasFile('photo')) {
            $path = $request->file('photo')->store('uploads/users/' . $user->id);
            $user->photo = basename($path);
            $user->save();
        }

        $token = $user->createToken('api-token')->plainTextToken;
        return response()->json(['user' => new UserResource($user), 'token' => $token], 201);
    }

    public function registerOwner(Request $request)
    {
        $validated = $request->validate([
            // User fields
            'name' => 'required|string|max:255',
            'gender' => 'required|in:Male,Female',
            'date_of_birth' => 'required|date',
            'email' => 'required|string|email|max:255|unique:users',
            'phone_no' => ['required|unique:users', 'string', 'regex:/^0[1-9]-[0-9]{8}$/'],
            'password' => [
                'required',
                'string',
                'confirmed',
                Password::min(8)
                        ->max(15) 
                        ->mixedCase()
                        ->numbers()
                        ->symbols(),
            ],
            'photo' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
            // Owner fields
            'company_name' => 'required|string|max:255',
            'business_reg_no' => 'required|string|max:12',
        ]);
        
        $user = DB::transaction(function () use ($validated, $request) {
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'gender' => $validated['gender'],
                'date_of_birth' => $validated['date_of_birth'],
                'phone_no' => $validated['phone_no'],
                'role' => 'Owner',
                'status' => 'Inactive',
            ]);

            if ($request->hasFile('photo')) {
                $path = $request->file('photo')->store('uploads/users/' . $user->id);
                $user->photo = basename($path);
                $user->save();
            }

            OwnerProfile::create([
                'user_id' => $user->id,
                'company_name' => $validated['company_name'],
                'business_reg_no' => $validated['business_reg_no'],
            ]);
            
            return $user;
        });

        $token = $user->createToken('api-token')->plainTextToken;
        return response()->json(['user' => new UserResource($user), 'token' => $token], 201);
    }
}