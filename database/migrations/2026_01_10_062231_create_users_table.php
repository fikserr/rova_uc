<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // database/migrations/xxxx_xx_xx_create_users_table.php
        Schema::create('users', function (Blueprint $table) {
            $table->unsignedBigInteger('id')->primary(); // telegram user_id
            $table->string('username')->nullable();
            $table->string('phone_number')->nullable();
            $table->string('role')->default('user');
            $table->timestamp('created_at')->useCurrent();
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
