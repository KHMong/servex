<?php
namespace App\Http\Controllers\Api\Organiser;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Tournament;
use App\Models\TournamentRegistration;
use App\Http\Resources\OrganiserRegistrationResource;
use Carbon\Carbon;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class OrganiserRegistrationController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request, Tournament $tournament)
    {
        $this->authorize('view', $tournament);

        $query = $tournament->registrations()
            ->with(['user', 'partner', 'category']);

        // Search filter (Name, Player ID)
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->whereHas('user', fn($u) => $u->where('name', 'like', "%$search%")->orWhere('user_id', 'like', "%$search%"))
                  ->orWhereHas('partner', fn($p) => $p->where('name', 'like', "%$search%")->orWhere('user_id', 'like', "%$search%"));
            });
        }

        // Status filter
        if ($request->filled('status') && $request->status !== 'All') {
            $query->where('status', $request->status);
        }

        // Payment status filter
        if ($request->filled('payment_status') && $request->payment_status !== 'All') {
            $query->where('payment_status', $request->payment_status);
        }

        // Tournament category filter
        if ($request->filled('category_id') && $request->category_id !== 'All') {
            $query->whereHas('category', fn($q) => $q->where('id', $request->category_id));
        }

        $registrations = $query->latest()->paginate(30);

        return OrganiserRegistrationResource::collection($registrations)->additional([
            'tournament_info' => [
                'title' => $tournament->name,
                'dates' => Carbon::parse($tournament->start_date)->format('d M Y') . ' - ' . Carbon::parse($tournament->end_date)->format('d M Y'),
                'filter_categories' => $tournament->selectedCategories->load('category')->map(fn($sc) => [
                    'id' => $sc->category->id, 
                    'name' => $sc->category->name
                ]),
            ]
        ]);
    }

    public function approve(TournamentRegistration $registration) 
    {
        $this->authorize('updateStatus', $registration);

        if ($registration->status !== 'Pending') {
            return response()->json(['message' => 'You can only approve Pending registrations.'], 422);
        }

        $registration->update(['status' => 'Approved']);
        return response()->json(['message' => 'Registration approved successfully.'], 201);
    }

    public function reject(TournamentRegistration $registration) 
    {
        $this->authorize('updateStatus', $registration);

        if (!in_array($registration->status, ['Pending', 'Approved'])) {
            return response()->json(['message' => 'You can only reject Pending/Approved registrations.'], 422);
        }

        $registration->update(['status' => 'Rejected']);
        return response()->json(['message' => 'Registration rejected successfully.'], 201);
    }

    public function updatePayment(TournamentRegistration $registration) 
    {
        $this->authorize('updateStatus', $registration);

        if ($registration->status !== 'Approved') {
            return response()->json(['message' => 'You can only update payment status for Approved registrations.'], 422);
        }

        $newStatus = $registration->payment_status === 'Paid' ? 'Unpaid' : 'Paid';
        $registration->update(['payment_status' => $newStatus]);
        
        return response()->json(['message' => "Payment status updated to $newStatus."], 201);
    }
}