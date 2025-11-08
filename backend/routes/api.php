<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Response;
use App\Http\Controllers\Api\Auth\AuthController;
use App\Http\Controllers\Api\Auth\PasswordResetController;
use App\Http\Controllers\Api\Public\HomeController;
use App\Http\Controllers\Api\Public\StateController;
use App\Http\Controllers\Api\Public\VenueController;
use App\Http\Controllers\Api\Public\CoachController;
use App\Http\Controllers\Api\Public\TournamentController;
use App\Http\Controllers\Api\Public\ActivityController;

use App\Http\Resources\UserResource;

// Authentication
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register/player', [AuthController::class, 'registerPlayer']);
Route::post('/register/owner', [AuthController::class, 'registerOwner']);

// Password
Route::post('/forgot-password', [PasswordResetController::class, 'sendResetLinkEmail']);
Route::post('/reset-password', [PasswordResetController::class, 'reset']);

// Home Page
Route::get('/home/featured-venues', [HomeController::class, 'getFeaturedVenues']);
Route::get('/home/upcoming-tournaments', [HomeController::class, 'getUpcomingTournaments']);

// State
Route::get('/states', [StateController::class, 'index']);

// Venue
Route::get('/venues', [VenueController::class, 'index']);
Route::get('/venues/{venue}', [VenueController::class, 'getVenueDetails']);
Route::get('/venues/{venue}/courts', [VenueController::class, 'getCourts']);
Route::get('/venues/{venue}/reviews', [VenueController::class, 'getReviews']);
Route::get('/venues/{venue}/availability-by-date', [VenueController::class, 'getAvailabilityByDate']);

// Coach
Route::get('/coaches', [CoachController::class, 'index']);
Route::get('/coaches/{user}', [CoachController::class, 'getCoachDetails']);

// Tournament
Route::get('/tournaments', [TournamentController::class, 'index']);
Route::get('/tournaments/{tournament}', [TournamentController::class, 'getTournamentDetails']);

// Activity
Route::get('/activities', [ActivityController::class, 'index']);
Route::get('/skill-levels', [ActivityController::class, 'getSkillLevels']);

// Images
Route::get('/images/{path}', function ($path) {
    // Prevent user from accessing files outside the uploads directory
    if (strpos($path, '..') !== false || strpos($path, '/') === 0) {
        abort(404, 'Invalid path');
    }

    // Ensure the file  exists in the uploads folder
    $fullPath = 'uploads/' . $path;

    if (!Storage::disk('local')->exists($fullPath)) {
        abort(404, 'Image not found');
    }

    // Get file content from storage
    $file = Storage::disk('local')->get($fullPath);

    // Get file's MIME type
    $serverPath = Storage::disk('local')->path($fullPath);
    $type = mime_content_type($serverPath);

    // This tells the browser how to interpret the file content.
    $response = Response::make($file, 200);
    $response->header("Content-Type", $type);

    return $response;

// Allows the {path} parameter to contain slashes (/)
})->where('path', '.*')->name('storage.image');

// User
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return new UserResource($request->user());
    });
});