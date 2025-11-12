<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Booking;
use App\Models\VoucherHistory;
use App\Models\TrainingSession;
use App\Models\SessionAttendance;
use App\Models\Tournament;
use App\Models\TournamentRegistration;
use Carbon\Carbon;
use Symfony\Component\HttpFoundation\Session\Session;

class UpdateSystemStatuses extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:update-system-statuses';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Update statuses for different tables';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $currentTime = now()->toDateTimeString();
        $this->info("{$currentTime}");

        $this->info('Starting status update process...');

        // 1. Cancel Pending Bookings After 5 Minutes
        $cancelledCount = Booking::where('status', 'Pending')
            ->where('created_at', '<=', Carbon::now()->subMinutes(5))
            ->update(['status' => 'Cancelled']);
        
        $this->info("Cancelled {$cancelledCount} pending bookings.");

        // 2. Set Completed Bookings
        $completedBookingCount = Booking::where('status', 'Confirmed')
            ->where('end_datetime', '<=', Carbon::now())
            ->update(['status' => 'Completed']);

        $this->info("Set {$completedBookingCount} bookings as completed.");

        // 3. Expire Vouchers
        $expiredCount = VoucherHistory::where('status', 'Available')
            ->where('expiry_date', '<', Carbon::today())
            ->update(['status' => 'Expired']);

        $this->info("Expired {$expiredCount} vouchers.");

        // 4. Set Completed Traning Sessions
        $completedTraningSessionCount = TrainingSession::where('status', 'Scheduled')
            ->where('end_datetime', '<=', Carbon::now())
            ->update(['status' => 'Completed']);

        $this->info("Set {$completedTraningSessionCount} traning sessions as completed.");

        // 5. Set Absent Session Attendance
        $absentCount = SessionAttendance::where('status', 'Pending')
            ->whereHas('trainingSession', function ($query) {
                $query->where('end_datetime', '<=', Carbon::now());
            })
            ->update(['status' => 'Absent']);
        
        $this->info("Set {$absentCount} session attendance as absent.");

        // 6. Set Ongoing Tournaments
        $ongoingTournamentCount = Tournament::where('status', 'Upcoming')
            ->where('start_date', '<=', Carbon::today())
            ->update(['status' => 'Ongoing']);
        
        $this->info("Set {$ongoingTournamentCount} tournaments as ongoing.");

        // 7. Set Completed Tournaments
        $completedTournamentCount = Tournament::where('status', 'Ongoing')
            ->where('end_date', '<', Carbon::today())
            ->update(['status' => 'Completed']);
        
        $this->info("Set {$completedTournamentCount} tournaments as completed.");

        // 8. Set Rejected Tournament Registrations
        $rejectedTournamentRegistrationCount = TournamentRegistration::where('status', 'Pending')
            ->whereHas('tournament', function ($query) {
                $query->where('end_date', '<', Carbon::today());
            })
            ->update(['status' => 'Rejected']);
        
        $this->info("Set {$rejectedTournamentRegistrationCount} tournament registrations as rejected.");

        $this->info('Status update process finished.' . PHP_EOL);
    }
}
