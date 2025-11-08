<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // --- Independent Tables (No Foreign Keys) ---

        Schema::create('user', function (Blueprint $table) {
            $table->id();
            $table->string('user_id')->unique(); // Custom user ID
            $table->string('name');
            $table->string('gender'); // 'M', 'F'
            $table->date('date_of_birth');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->string('phone_no'); // E.g. 018-1234567
            $table->string('photo')->nullable(); // Profile picture
            $table->string('role'); // 'Player', 'Admin', 'Owner'
            $table->boolean('is_coach')->default(false);
            $table->boolean('is_organiser')->default(false);
            $table->integer('points')->default(0);
            $table->string('status'); // 'Active', 'Inactive', 'Terminated'
            $table->rememberToken();
            $table->timestamps();
        });

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('state', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->timestamps();
        });

        Schema::create('tournament_category', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->timestamps();
        });

        Schema::create('skill_level', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->timestamps();
        });

        Schema::create('voucher', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->text('description');
            $table->decimal('discount_value', 8, 2);
            $table->integer('point_cost');
            $table->integer('validity'); // Number of days
            $table->string('status'); // 'Active', 'Inactive', 'Terminated'
            $table->timestamps();
        });

        // --- Dependent Tables (Level 1) ---

        Schema::create('owner_profile', function (Blueprint $table) {
            $table->foreignId('user_id')->primary()->constrained('user')->onDelete('cascade');
            $table->string('company_name');
            $table->string('business_reg_no');
            $table->string('status'); // 'Pending', 'Approved', 'Rejected'
            $table->timestamps();
        });

        Schema::create('coach_profile', function (Blueprint $table) {
            $table->foreignId('user_id')->primary()->constrained('user')->onDelete('cascade');
            $table->foreignId('state_id')->constrained('state');
            $table->text('bio');
            $table->integer('exp_year');
            $table->string('cert')->nullable(); // Certificate file
            $table->string('status'); // 'Pending', 'Approved', 'Rejected', 'Cancelled'
            $table->timestamps();
        });

        Schema::create('organiser_pass', function (Blueprint $table) {
            $table->foreignId('user_id')->primary()->constrained('user')->onDelete('cascade');
            $table->decimal('amount', 8, 2);
            $table->date('purchase_date');
            $table->timestamps();
        });

        Schema::create('venue', function (Blueprint $table) {
            $table->id();
            $table->foreignId('owner_id')->constrained('user');
            $table->foreignId('state_id')->constrained('state');
            $table->string('name');
            $table->text('address');
            $table->time('opening_time');
            $table->time('closing_time');
            $table->string('phone_no'); // E.g. 03-12345678
            $table->string('apply_status'); // 'Pending', 'Approved', 'Rejected', 'Cancelled'
            $table->string('status'); // 'Active', 'Inactive', 'Terminated'
            $table->timestamps();
        });

        Schema::create('tournament', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organiser_id')->constrained('user');
            $table->foreignId('state_id')->constrained('state');
            $table->string('name');
            $table->string('photo'); // Tournament banner picture
            $table->text('venue_address');
            $table->date('start_date');
            $table->date('end_date');
            $table->date('deadline');
            $table->text('description');
            $table->text('prize');
            $table->text('rule');
            $table->text('result')->nullable(); // Result file
            $table->string('status'); // 'Upcoming', 'Ongoing', 'Completed', 'Cancelled'
            $table->timestamps();
        });

        // --- Dependent Tables (Level 2) ---

        Schema::create('court', function (Blueprint $table) {
            $table->id();
            $table->foreignId('venue_id')->constrained('venue')->onDelete('cascade');
            $table->string('name');
            $table->string('status'); // 'Available', 'Maintenance', 'Terminated'
            $table->timestamps();
        });

        Schema::create('venue_photo', function (Blueprint $table) {
            $table->id();
            $table->foreignId('venue_id')->constrained('venue')->onDelete('cascade');
            $table->string('photo'); // Venue picture
            $table->timestamp('created_at');
        });

        Schema::create('pricing_rule', function (Blueprint $table) {
            $table->id();
            $table->foreignId('venue_id')->constrained('venue')->onDelete('cascade');
            $table->string('day_type'); // 'Weekday', 'Weekend'
            $table->time('start_time');
            $table->time('end_time');
            $table->decimal('price', 8, 2);
            $table->timestamps();
        });

        Schema::create('venue_review', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('user');
            $table->foreignId('venue_id')->constrained('venue');
            $table->tinyInteger('rating'); // 1-5
            $table->text('comment')->nullable();
            $table->string('status'); // 'Active', 'Terminated'
            $table->timestamps();
        });

        Schema::create('trainee_group', function (Blueprint $table) {
            $table->id();
            $table->foreignId('coach_id')->constrained('user');
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('status'); // 'Active', 'Terminated'
            $table->timestamps();
        });

        Schema::create('tournament_selected_category', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tournament_id')->constrained('tournament')->onDelete('cascade');
            $table->foreignId('category_id')->constrained('tournament_category');
            $table->decimal('entry_fee', 8, 2);
            $table->timestamp('created_at');
        });

        // --- Dependent Tables (Level 3) ---

        Schema::create('booking', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('user');
            $table->foreignId('court_id')->constrained('court');
            $table->string('booking_id')->unique(); // Custom booking ID
            $table->dateTime('start_datetime');
            $table->dateTime('end_datetime');
            $table->decimal('total_price', 8, 2);
            $table->string('payment_status'); // 'Paid', 'Unpaid'
            $table->string('status'); // 'Pending', 'Confirmed', 'Completed', 'Cancelled'
            $table->timestamps();
        });

        Schema::create('group_member', function (Blueprint $table) {
            $table->id();
            $table->foreignId('trainee_group_id')->constrained('trainee_group')->onDelete('cascade');
            $table->foreignId('trainee_id')->constrained('user');
            $table->string('status'); // 'Active', 'Terminated'
            $table->timestamps();
        });

        // --- Dependent Tables (Level 4) ---

        Schema::create('training_session', function (Blueprint $table) {
            $table->id();
            $table->foreignId('trainee_group_id')->constrained('trainee_group')->onDelete('cascade');
            $table->string('name');
            $table->text('description')->nullable();
            $table->dateTime('start_datetime');
            $table->dateTime('end_datetime');
            $table->string('status'); // 'Scheduled', 'Completed', 'Cancelled'
            $table->timestamps();
        });
        
        Schema::create('tournament_registration', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('user');
            $table->foreignId('partner_id')->nullable()->constrained('user');
            $table->foreignId('tournament_id')->constrained('tournament');
            $table->foreignId('category_id')->constrained('tournament_category');
            $table->string('ec_phone_no'); // E.g. 018-1234567
            $table->string('payment_status'); // 'Paid', 'Unpaid'
            $table->string('status'); // 'Pending', 'Approved', 'Rejected', 'Cancelled'
            $table->timestamps();
        });

        Schema::create('activity', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('user');
            $table->foreignId('booking_id')->unique()->constrained('booking');
            $table->foreignId('skill_level_id')->constrained('skill_level');
            $table->decimal('fee', 8, 2);
            $table->integer('max_player');
            $table->string('status'); // 'Open', 'Full', 'Cancelled'
            $table->timestamps();
        });
        
        Schema::create('voucher_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('user');
            $table->foreignId('voucher_id')->constrained('voucher');
            $table->foreignId('booking_id')->nullable()->constrained('booking');
            $table->date('expiry_date');
            $table->string('status'); // 'Available', 'Used', 'Expired'
            $table->timestamps();
        });

        // --- Dependent Tables (Level 5) ---

        Schema::create('session_attendance', function (Blueprint $table) {
            $table->id();
            $table->foreignId('training_session_id')->constrained('training_session')->onDelete('cascade');
            $table->foreignId('group_member_id')->constrained('group_member');
            $table->text('comment')->nullable();
            $table->string('status'); // 'Pending', 'Present', 'Absent'
            $table->timestamps();
        });

        Schema::create('activity_participant', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('user');
            $table->foreignId('activity_id')->constrained('activity')->onDelete('cascade');
            $table->string('status'); // 'Joined', 'Left', 'Removed'
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop tables in the reverse order of creation to avoid foreign key constraint issues
        Schema::dropIfExists('activity_participant');
        Schema::dropIfExists('session_attendance');
        Schema::dropIfExists('voucher_history');
        Schema::dropIfExists('activity');
        Schema::dropIfExists('tournament_registration');
        Schema::dropIfExists('training_session');
        Schema::dropIfExists('group_member');
        Schema::dropIfExists('booking');
        Schema::dropIfExists('tournament_selected_category');
        Schema::dropIfExists('trainee_group');
        Schema::dropIfExists('venue_review');
        Schema::dropIfExists('pricing_rule');
        Schema::dropIfExists('venue_photo');
        Schema::dropIfExists('court');
        Schema::dropIfExists('tournament');
        Schema::dropIfExists('venue');
        Schema::dropIfExists('organiser_pass');
        Schema::dropIfExists('coach_profile');
        Schema::dropIfExists('owner_profile');
        Schema::dropIfExists('voucher');
        Schema::dropIfExists('skill_level');
        Schema::dropIfExists('tournament_category');
        Schema::dropIfExists('state');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('user');
    }
};