<?php
namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Http\Resources\UserManagementResource;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class UserManagementController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request)
    {
        $query = User::query()->where('status', '!=', 'Terminated');

        // Filter (Role)
        if ($request->filled('role')) {
            $query->where('role', strtolower($request->role));
        }

        // Filter (Status)
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter (Is coach)
        if ($request->boolean('is_coach')) {
            $query->where('is_coach', true);
        }

        // Filter (Is organiser)
        if ($request->boolean('is_organiser')) {
            $query->where('is_organiser', true);
        }

        // Search filter (User ID, Name, Email, Phone No)
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('user_id', 'like', "%$search%")
                  ->orWhere('name', 'like', "%$search%")
                  ->orWhere('email', 'like', "%$search%")
                  ->orWhere('phone_no', 'like', "%$search%");
            });
        }

        $users = $query->latest()->paginate(30);

        return UserManagementResource::collection($users);
    }

    public function deleteUser(User $user)
    {
        $this->authorize('update', $user);

        if ($user->id === request()->user()->id) {
            return response()->json(['message' => 'You cannot delete your own account.'], 403);
        }

        $user->update(['status' => 'Terminated']);

        return response()->json(['message' => 'User account deleted successfully.']);
    }
}