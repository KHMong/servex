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
use App\Http\Controllers\Api\User\ProfileController;
use App\Http\Controllers\Api\Player\BookingController;
use App\Http\Controllers\Api\Player\VenueReviewController;
use App\Http\Controllers\Api\Player\RewardController;
use App\Http\Controllers\Api\Player\TournamentRegistrationController;
use App\Http\Controllers\Api\Player\OrganiserController;
use App\Http\Controllers\Api\Player\TrainingController;
use App\Http\Controllers\Api\Coach\DashboardController;
use App\Http\Controllers\Api\Coach\TraineeGroupController;
use App\Http\Controllers\Api\Coach\GroupMemberController;
use App\Http\Controllers\Api\Coach\TrainingSessionController;
use App\Http\Controllers\Api\Coach\SessionAttendanceController;
use App\Http\Controllers\Api\Organiser\OrganiserDashboardController;
use App\Http\Controllers\Api\Organiser\OrganiserTournamentController;
use App\Http\Controllers\Api\Organiser\OrganiserRegistrationController;
use App\Http\Controllers\Api\Owner\OwnerDashboardController;
use App\Http\Controllers\Api\Owner\OwnerVenueController;

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

    // Ensure the file exists in the uploads folder
    $fullPath = 'uploads/' . $path;

    if (!Storage::disk('local')->exists($fullPath)) {
        abort(404, 'Image not found');
    }

    // Get file content from storage
    $file = Storage::disk('local')->get($fullPath);

    // Get file's MIME type
    $serverPath = Storage::disk('local')->path($fullPath);
    $type = mime_content_type($serverPath);

    // Tell the browser how to interpret the file content
    $response = Response::make($file, 200);
    $response->header("Content-Type", $type);

    return $response;

// Allows the {path} parameter to contain slashes (/)
})->where('path', '.*')->name('storage.image');

// User
Route::middleware('auth:sanctum')->group(function () {
    // User Profile
    Route::get('/user', [ProfileController::class, 'getUserProfile']);
    Route::put('/user', [ProfileController::class, 'updateUserProfile']);

    // Coach Profile
    Route::get('/user/coach-profile', [ProfileController::class, 'getCoachProfile']);
    Route::put('/user/coach-profile', [ProfileController::class, 'updateCoachProfile']);

    // Change Password
    Route::put('/user/change-password', [ProfileController::class, 'changePassword']);

    // Venue
    Route::get('/auth/venues/{venue}', [VenueController::class, 'getVenueDetails']);
});

// Player only
Route::middleware('auth:sanctum', 'can:player-only')->group(function () {
    // Bookings
    Route::post('/bookings', [BookingController::class, 'book']);
    Route::get('/bookings/{booking}', [BookingController::class, 'getBookingDetails']);
    Route::get('/user/vouchers', [BookingController::class, 'getAvailableVouchers']);
    Route::get('/user/booking-history', [BookingController::class, 'getBookingHistory']);
    Route::put('/bookings/{booking}/cancel', [BookingController::class, 'cancelBooking']);
    Route::post('/bookings/{booking}/create-checkout-session', [BookingController::class, 'createCheckoutSession']);
    Route::post('/bookings/verify-payment', [BookingController::class, 'verifyPayment']);

    // Review
    Route::post('/reviews', [VenueReviewController::class, 'submitReview']);
    Route::get('/reviews/{review}', [VenueReviewController::class, 'getReview']);
    Route::put('/reviews/{review}', [VenueReviewController::class, 'editReview']);

    // Rewards and Vouchers
    Route::get('/rewards', [RewardController::class, 'getPointsAndVouchers']);
    Route::post('/vouchers/{voucher}/redeem', [RewardController::class, 'redeem']);
    Route::get('/user/voucher-history', [RewardController::class, 'getVoucherHistory']);

    // Tournaments
    Route::get('/tournaments/{tournament}/registration-form', [TournamentRegistrationController::class, 'getForm']);
    Route::post('/tournaments/{tournament}/register', [TournamentRegistrationController::class, 'register']);
    Route::get('/user/tournament-history', [TournamentRegistrationController::class, 'getTournamentHistory']);
    Route::put('/tournament-registration/{tournament_registration}/cancel', [TournamentRegistrationController::class, 'cancelRegistration']);

    // Activities
    Route::post('/activities', [ActivityController::class, 'create']);
    Route::get('/activities/create-form', [ActivityController::class, 'getForm']);
    Route::get('/activities/{activity}', [ActivityController::class, 'getActivityDetails']);
    Route::put('/activities/{activity}', [ActivityController::class, 'editActivityDetails']);
    Route::get('/user/activity-history', [ActivityController::class, 'getActivityHistory']);
    Route::post('/activities/{activity}/join', [ActivityController::class, 'joinActivity']);
    Route::post('/activities/{activity}/leave', [ActivityController::class, 'leaveActivity']);
    Route::put('/activities/{activity}/cancel', [ActivityController::class, 'cancelActivity']);

    // Activity Participants
    Route::get('/activities/{activity}/participants', [ActivityController::class, 'getParticipants']);
    Route::put('/activity-participant/{activity_participant}/remove', [ActivityController::class, 'removeParticipant']);

    // Organiser Pass
    Route::post('/organiser/verify-payment', [OrganiserController::class, 'verifyPayment']);

    // My Training
    Route::get('/player/training/groups', [TrainingController::class, 'getGroups']);
    Route::get('/player/training/sessions', [TrainingController::class, 'getSessions']);
});

// Player (Not coach)
Route::middleware('auth:sanctum', 'can:player-not-coach')->group(function () {
    Route::post('/coach/apply', [ProfileController::class, 'applyForCoach']);
});

// Player (Not organiser)
Route::middleware('auth:sanctum', 'can:player-not-organiser')->group(function () {
    Route::post('/organiser/create-checkout-session', [OrganiserController::class, 'createCheckoutSession']);
});

// Coach only
Route::middleware('auth:sanctum', 'can:coach-only')->group(function () {
    // Dashboard
    Route::get('/coach/dashboard', [DashboardController::class, 'index']);
    Route::get('/coach/dashboard/upcoming-sessions', [DashboardController::class, 'getUpcomingSessions']);

    // Trainee Groups
    Route::get('/coach/groups', [TraineeGroupController::class, 'index']);
    Route::post('/coach/groups', [TraineeGroupController::class, 'createGroup']);
    Route::get('/coach/groups/{group}', [TraineeGroupController::class, 'getGroupInfo']);
    Route::put('/coach/groups/{group}', [TraineeGroupController::class, 'editGroupInfo']);
    Route::delete('/coach/groups/{group}', [TraineeGroupController::class, 'deleteGroup']);
    
    // Group Members
    Route::get('/coach/groups/{group}/trainees', [GroupMemberController::class, 'index']);
    Route::post('/coach/groups/{group}/trainees', [GroupMemberController::class, 'addMember']);
    Route::delete('/coach/group-members/{groupMember}', [GroupMemberController::class, 'removeMember']);
    
    // Training Sessions
    Route::get('/coach/groups/{group}/sessions', [TrainingSessionController::class, 'index']);
    Route::post('/coach/groups/{group}/sessions', [TrainingSessionController::class, 'createSession']);
    Route::get('/coach/sessions/{session}', [TrainingSessionController::class, 'getSessionDetails']);
    Route::put('/coach/sessions/{session}', [TrainingSessionController::class, 'editSessionDetails']);
    Route::delete('/coach/sessions/{session}', [TrainingSessionController::class, 'cancelSession']);

    // Session Attendance
    Route::get('/coach/sessions/{session}/attendance', [SessionAttendanceController::class, 'index']);
    Route::put('/coach/sessions/{session}/attendance/update', [SessionAttendanceController::class, 'update']);
    Route::put('/coach/sessions/{session}/attendance/batch', [SessionAttendanceController::class, 'batchUpdate']);
    Route::post('/coach/sessions/{session}/comments', [SessionAttendanceController::class, 'saveComments']);
});

// Organiser only
Route::middleware('auth:sanctum', 'can:organiser-only')->group(function () {
    // Dashboard
    Route::get('/organiser/dashboard/stats', [OrganiserDashboardController::class, 'getStats']);
    Route::get('/organiser/dashboard/tournaments-stats', [OrganiserDashboardController::class, 'getTournamentStats']);

    // Tournaments
    Route::get('/organiser/tournaments', [OrganiserTournamentController::class, 'index']);
    Route::get('/organiser/tournaments/create-info', [OrganiserTournamentController::class, 'getCreateInfo']);
    Route::post('/organiser/tournaments', [OrganiserTournamentController::class, 'createTournament']);
    Route::get('/organiser/tournaments/{tournament}', [OrganiserTournamentController::class, 'getTournamentDetails']);
    Route::put('/organiser/tournaments/{tournament}', [OrganiserTournamentController::class, 'editTournamentDetails']);
    Route::post('/organiser/tournaments/{tournament}/result', [OrganiserTournamentController::class, 'updateResult']);
    Route::delete('/organiser/tournaments/{tournament}', [OrganiserTournamentController::class, 'cancelTournament']);

    // Tournament Registrations
    Route::get('/organiser/tournaments/{tournament}/registrations', [OrganiserRegistrationController::class, 'index']);
    Route::put('/organiser/registrations/{registration}/approve', [OrganiserRegistrationController::class, 'approve']);
    Route::put('/organiser/registrations/{registration}/reject', [OrganiserRegistrationController::class, 'reject']);
    Route::put('/organiser/registrations/{registration}/update-payment', [OrganiserRegistrationController::class, 'updatePayment']);
});

// Owner only
Route::middleware('auth:sanctum', 'can:owner-only')->group(function () {
    // Dashboard
    Route::get('/owner/dashboard', [OwnerDashboardController::class, 'index']);

    // Venues
    Route::get('/owner/venues', [OwnerVenueController::class, 'index']);
    Route::post('/owner/venues', [OwnerVenueController::class, 'applyVenue']);
    Route::get('/owner/venues/{venue}', [OwnerVenueController::class, 'getVenueDetails']);
    Route::post('/owner/venues/{venue}', [OwnerVenueController::class, 'editVenueDetails']);
    Route::delete('/owner/venues/{venue}/cancel', [OwnerVenueController::class, 'cancelVenueApplication']);
    Route::delete('/owner/venues/{venue}/delete', [OwnerVenueController::class, 'deleteVenue']);
});