<?php
namespace App\Http\Controllers\Api\Owner;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Booking;
use App\Models\Venue;

class OwnerDashboardController extends Controller
{
    // Assume that we don't do refund for Cancelled bookings

    public function index(Request $request)
    {
        $user = $request->user();
        $year = $request->input('year', date('Y'));
        $month = $request->input('month', date('n')); // 1-12
        $filterType = $request->input('filter_type', 'all_time'); // All Time/Month/Year

        $bookingsQuery = Booking::whereHas('court.venue', function ($q) use ($user) {
            $q->where('owner_id', $user->id);
        });

        // Apply Filters for Stats
        $applyFilter = function($query, $dateCol = 'start_datetime') use ($filterType, $year, $month) {
            if ($filterType === 'year') { // Year
                $query->whereYear($dateCol, $year);
            } elseif ($filterType === 'month') { // Month
                $query->whereYear($dateCol, $year)->whereMonth($dateCol, $month);
            }
            // All Time
            return $query;
        };

        $statsQuery = clone $bookingsQuery;
        $applyFilter($statsQuery);

        // STATS CARD
        // 1. Total Revenue (RM)
        $totalRevenue = (clone $statsQuery)
            ->whereIn('status', ['Confirmed', 'Completed', 'Cancelled'])
            ->sum('total_price');

        // 2. Total Bookings
        $totalBookings = (clone $statsQuery)
            ->whereIn('status', ['Confirmed', 'Completed', 'Cancelled'])
            ->count();

        // 3. Avg. Booking Value
        $completedCount = (clone $statsQuery)->whereIn('status', ['Confirmed', 'Completed', 'Cancelled'])->count();
        $avgBookingValue = $completedCount > 0 ? $totalRevenue / $completedCount : 0;

        // 4. Busiest Day
        $busiestDayData = (clone $statsQuery)
            ->whereIn('status', ['Confirmed', 'Completed', 'Cancelled'])
            ->selectRaw('DAYNAME(start_datetime) as day, count(*) as count')
            ->groupBy('day')
            ->orderByDesc('count')
            ->first();
        $busiestDay = $busiestDayData ? $busiestDayData->day : 'N/A';


        // CHARTS
        // Chart 1: Peak Booking Hours (0-23)
        $peakHoursData = (clone $statsQuery)
            ->whereIn('status', ['Confirmed', 'Completed', 'Cancelled'])
            ->selectRaw('HOUR(start_datetime) as hour, count(*) as count')
            ->groupBy('hour')
            ->pluck('count', 'hour')
            ->toArray();
        
        // Fill missing hours with 0
        $peakHours = [];
        for ($i = 0; $i < 24; $i++) {
            $peakHours[] = $peakHoursData[$i] ?? 0;
        }

        // Chart 2: Revenue by Venue
        $venueRevenueData = Venue::where('owner_id', $user->id)
            ->where('status', 'Active')
            ->withSum(['bookings' => function($q) use ($year, $month, $filterType) {
                $q->whereIn('booking.status', ['Confirmed', 'Completed', 'Cancelled']);
                if ($filterType === 'year') $q->whereYear('start_datetime', $year);
                if ($filterType === 'month') $q->whereYear('start_datetime', $year)->whereMonth('start_datetime', $month);
            }], 'total_price')
            ->get();
        
        $revenueByVenue = [
            'labels' => $venueRevenueData->pluck('name'),
            'data' => $venueRevenueData->pluck('bookings_sum_total_price')->map(fn($val) => $val ?? 0),
        ];

        // Chart 3: Revenue by Month (Year)
        $chartYear = ($filterType === 'all_time') ? date('Y') : $year;

        $monthlyRevenueData = (clone $bookingsQuery)
            ->whereIn('status', ['Confirmed', 'Completed', 'Cancelled'])
            ->whereYear('start_datetime', $year)
            ->selectRaw('MONTH(start_datetime) as month, sum(total_price) as total')
            ->groupBy('month')
            ->pluck('total', 'month')
            ->toArray();

        // Fill missing months with 0
        $revenueByMonth = [];
        for ($i = 1; $i <= 12; $i++) {
            $revenueByMonth[] = $monthlyRevenueData[$i] ?? 0;
        }

        return response()->json([
            'stats' => [
                'total_revenue' => number_format($totalRevenue, 2),
                'total_bookings' => $totalBookings,
                'avg_booking_value' => number_format($avgBookingValue, 2),
                'busiest_day' => $busiestDay,
            ],
            'charts' => [
                'year' => $chartYear,
                'peak_hours' => $peakHours,
                'revenue_by_venue' => $revenueByVenue,
                'revenue_by_month' => $revenueByMonth,
            ]
        ]);
    }
}