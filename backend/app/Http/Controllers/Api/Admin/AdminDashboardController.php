<?php
namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Venue;
use App\Models\Booking;
use App\Models\OwnerProfile;
use App\Models\CoachProfile;
use App\Models\TrainingSession;
use App\Models\Tournament;
use App\Models\Activity;

class AdminDashboardController extends Controller
{
    public function index(Request $request)
    {
        // Filters
        $year = $request->input('year', date('Y'));
        $month = $request->input('month', date('n')); // 1-12
        $filterType = $request->input('filter_type', 'all_time'); // All Time/Month/Year

        $applyFilter = function($query, $dateColumn = 'created_at') use ($filterType, $year, $month) {
            if ($filterType === 'year') { // Year
                $query->whereYear($dateColumn, $year);
            } elseif ($filterType === 'month') { // Month
                $query->whereYear($dateColumn, $year)->whereMonth($dateColumn, $month);
            }
            // All Time
            return $query;
        };


        // STATS CARD
        // 1. Total Players
        $playersQuery = User::where('role', 'player')->where('status', '!=', 'Terminated');
        $totalPlayers = $applyFilter($playersQuery)->count();

        // 2. Total Coaches
        $coachesQuery = User::where('is_coach', true)->where('status', '!=', 'Terminated')
            ->whereHas('coachProfile', function($q) use ($filterType, $year, $month) {
                if ($filterType === 'year') $q->whereYear('created_at', $year);
                if ($filterType === 'month') $q->whereYear('created_at', $year)->whereMonth('created_at', $month);
            });
        $totalCoaches = $coachesQuery->count();

        // 3. Total Organisers
        $organisersQuery = User::where('is_organiser', true)->where('status', '!=', 'Terminated')
             ->whereHas('organiserPass', function($q) use ($filterType, $year, $month) {
                if ($filterType === 'year') $q->whereYear('created_at', $year);
                if ($filterType === 'month') $q->whereYear('created_at', $year)->whereMonth('created_at', $month);
            });
        $totalOrganisers = $organisersQuery->count();

        // 4. Active Venues
        $venuesQuery = Venue::where('status', 'Active');
        $activeVenues = $applyFilter($venuesQuery)->count();
        
        // 5. Total Bookings
        $bookingsQuery = Booking::whereIn('status', ['Confirmed', 'Completed']);
        $totalBookings = $applyFilter($bookingsQuery, 'start_datetime')->count();

        
        // PENDING APPLICATIONS CARD
        // 1. Owner
        $pendingOwners = OwnerProfile::where('status', 'Pending')->count();

        // 2. Coach
        $pendingCoaches = CoachProfile::where('status', 'Pending')->count();

        // 3. Venue
        $pendingVenues = Venue::where('apply_status', 'Pending')->count();


        // CHARTS
        $chartYear = ($filterType === 'all_time') ? date('Y') : $year;

        // Fill 12 months with 0
        $fillMonths = function ($data) {
            $result = [];
            for ($i = 1; $i <= 12; $i++) {
                $result[] = $data[$i] ?? 0;
            }
            return $result;
        };

        // Chart 1: New User Registrations
        $newUsersData = User::where('status', 'Active')
            ->whereYear('created_at', $year)
            ->selectRaw('MONTH(created_at) as month, count(*) as count')
            ->groupBy('month')
            ->pluck('count', 'month')->toArray();
        
        // Chart 2: Total Bookings by Month
        $monthlyBookingsData = Booking::whereIn('status', ['Confirmed', 'Completed'])
            ->whereYear('start_datetime', $year)
            ->selectRaw('MONTH(start_datetime) as month, count(*) as count')
            ->groupBy('month')
            ->pluck('count', 'month')->toArray();

        // Chart 3: Total Training Sessions by Month
        $trainingSessionsData = TrainingSession::where('status', '!=', 'Cancelled')
            ->whereYear('start_datetime', $year)
            ->selectRaw('MONTH(start_datetime) as month, count(*) as count')
            ->groupBy('month')
            ->pluck('count', 'month')->toArray();

        // Chart 4: Total Tournaments by Month
        $tournamentsData = Tournament::where('status', '!=', 'Cancelled')
            ->whereYear('start_date', $year)
            ->selectRaw('MONTH(start_date) as month, count(*) as count')
            ->groupBy('month')
            ->pluck('count', 'month')->toArray();

        // Chart 5: Total Activities by Month
        $activitiesData = Activity::where('activity.status', '!=', 'Cancelled')
            ->whereHas('booking', function($q) use ($year) {
                $q->whereYear('start_datetime', $year);
            })
            ->join('booking', 'activity.booking_id', '=', 'booking.id')
            ->selectRaw('MONTH(booking.start_datetime) as month, count(activity.id) as count')
            ->groupBy('month')
            ->pluck('count', 'month')->toArray();


        return response()->json([
            'stats' => [
                'total_players' => $totalPlayers,
                'total_coaches' => $totalCoaches,
                'total_organisers' => $totalOrganisers,
                'active_venues' => $activeVenues,
                'total_bookings' => $totalBookings,
                'pending_owners' => $pendingOwners,
                'pending_coaches' => $pendingCoaches,
                'pending_venues' => $pendingVenues,
            ],
            'charts' => [
                'year' => $chartYear,
                'new_users' => $fillMonths($newUsersData),
                'bookings' => $fillMonths($monthlyBookingsData),
                'training_sessions' => $fillMonths($trainingSessionsData),
                'tournaments' => $fillMonths($tournamentsData),
                'activities' => $fillMonths($activitiesData),
            ]
        ]);
    }
}