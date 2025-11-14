<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command('bookings:cancel-expired-bookings')
    ->everyMinute()
    ->appendOutputTo(storage_path('logs/scheduler.log'));

Schedule::command('app:perform-daily-cleanup')
    ->dailyAt('00:00')
    ->appendOutputTo(storage_path('logs/scheduler.log'));

