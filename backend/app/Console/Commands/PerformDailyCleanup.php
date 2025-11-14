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

class PerformDailyCleanup extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:perform-daily-cleanup';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Update statuses of different tables';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $currentTime = Carbon::now()->toDateTimeString();
        $this->info("{$currentTime}");

        $this->info('Starting daily cleanup process...');

        // 1. Set Completed Bookings
        $completedBookingCount = Booking::where('status', 'Confirmed')
            ->where('end_datetime', '<=', Carbon::now())
            ->update(['status' => 'Completed']);

        $this->info("Set {$completedBookingCount} bookings as completed.");

        // 2. Expire Vouchers
        $expiredCount = VoucherHistory::where('status', 'Available')
            ->where('expiry_date', '<', Carbon::today())
            ->update(['status' => 'Expired']);

        $this->info("Expired {$expiredCount} vouchers.");

        // 3. Set Completed Traning Sessions
        $completedTraningSessionCount = TrainingSession::where('status', 'Scheduled')
            ->where('end_datetime', '<=', Carbon::now())
            ->update(['status' => 'Completed']);

        $this->info("Set {$completedTraningSessionCount} traning sessions as completed.");

        // 4. Set Absent Session Attendance
        $absentCount = SessionAttendance::where('status', 'Pending')
            ->whereHas('trainingSession', function ($query) {
                $query->where('end_datetime', '<=', Carbon::now());
            })
            ->update(['status' => 'Absent']);
        
        $this->info("Set {$absentCount} session attendance as absent.");

        // 5. Set Ongoing Tournaments
        $ongoingTournamentCount = Tournament::where('status', 'Upcoming')
            ->where('start_date', '<=', Carbon::today())
            ->update(['status' => 'Ongoing']);
        
        $this->info("Set {$ongoingTournamentCount} tournaments as ongoing.");

        // 6. Set Completed Tournaments
        $completedTournamentCount = Tournament::where('status', 'Ongoing')
            ->where('end_date', '<', Carbon::today())
            ->update(['status' => 'Completed']);
        
        $this->info("Set {$completedTournamentCount} tournaments as completed.");

        // 7. Set Rejected Tournament Registrations
        $rejectedTournamentRegistrationCount = TournamentRegistration::where('status', 'Pending')
            ->whereHas('tournament', function ($query) {
                $query->where('end_date', '<', Carbon::today());
            })
            ->update(['status' => 'Rejected']);
        
        $this->info("Set {$rejectedTournamentRegistrationCount} tournament registrations as rejected.");

        $this->info('Daily cleanup process finished.' . PHP_EOL);
    }
}
