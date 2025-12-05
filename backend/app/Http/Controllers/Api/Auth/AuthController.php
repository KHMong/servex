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
use Illuminate\Validation\Rule;
use Carbon\Carbon;

/*

PASSWORD REQUIREMENTS:
1. 8-15 characters
2. Must have uppercase and lowercase letters
3. Must have at least one number
4. Must have at least one special character

BUSINESS REG NO REGEX:
`((19|20)[0-9]{2})` : First two digits must start with 19 or 20, followed by two random digits.
`(0[1-6])` : Middle 2 digits: Must start with 0 followed by a number between 1 to 6.
`([0-9]{6})` : Random 6 digits

*/

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $credentialsWithStatus = [
            'email' => $credentials['email'],
            'password' => $credentials['password'],
            'status' => 'Active',
        ];

        if (!Auth::attempt($credentialsWithStatus)) {
            return response()->json([
                'message' => "Invalid login credentials / Inactive account, please try again."
            ], 401); // 401 Unauthorised
        }

        $user = $request->user();
        $user->loadMissing('ownerProfile');
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
            'gender' => 'required|in:M,F',
            'date_of_birth' => [
                'required',
                'date',
                'before_or_equal:' . Carbon::now()->subYears(7)->format('Y-m-d'),
            ],
            'email' => 'required|string|email|max:255|unique:user,email',
            'phone_no' => 'required|string|unique:user,phone_no|regex:/^01[0-9]-[0-9]{7,8}$/',
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
            'gender' => $validated['gender'],
            'date_of_birth' => $validated['date_of_birth'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'phone_no' => $validated['phone_no'],
            'role' => 'Player',
            'status' => 'Active',
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
            'gender' => 'required|in:M,F',
            'date_of_birth' => [
                'required',
                'date',
                'before_or_equal:' . Carbon::now()->subYears(15)->format('Y-m-d'),
            ],
            'email' => 'required|string|email|max:255|unique:user,email',
            'phone_no' => 'required|string|unique:user,phone_no|regex:/^0[1-9]-[0-9]{8}$/',
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
            'business_reg_no' => [
                'required',
                'string',
                'max:12',
                'regex:/^((19|20)[0-9]{2})(0[1-6])([0-9]{6})$/',
                Rule::unique('owner_profile', 'business_reg_no')->where(function ($query) {
                    return $query->where('status', 'Approved');
                }),
            ],
        ]);
        
        $user = DB::transaction(function () use ($validated, $request) {
            $user = User::create([
                'name' => $validated['name'],
                'gender' => $validated['gender'],
                'date_of_birth' => $validated['date_of_birth'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
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
                'status' => 'Pending',
            ]);
            
            return $user;
        });

        $token = $user->createToken('api-token')->plainTextToken;
        return response()->json(['user' => new UserResource($user), 'token' => $token], 201);
    }
}