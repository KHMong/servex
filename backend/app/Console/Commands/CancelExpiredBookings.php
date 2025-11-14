<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Booking;
use Carbon\Carbon;

class CancelExpiredBookings extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'bookings:cancel-expired-bookings';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Cancels pending bookings that have expired (After 5 minutes)';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $currentTime = Carbon::now('Asia/Kuala_Lumpur')->toDateTimeString();
        $this->info("{$currentTime}");

        $this->info('Starting cancel expired booking process...');

        $cancelledCount = Booking::where('status', 'Pending')
            ->where('created_at', '<=', Carbon::now()->subMinutes(5))
            ->update(['status' => 'Cancelled']);
        
        $this->info("Cancelled {$cancelledCount} pending bookings.");

        $this->info('Cancel expired booking process finished.' . PHP_EOL);
    }
}
