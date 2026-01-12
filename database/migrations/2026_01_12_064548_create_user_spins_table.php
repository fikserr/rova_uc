<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('user_spins', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('sector_id');

            $table->enum('reward_type', ['balance', 'pubg', 'none']);
            $table->decimal('reward_value', 15, 2);
            $table->timestamp('created_at')->useCurrent();

            $table->foreign('user_id')->references('id')->on('users');
            $table->foreign('sector_id')->references('id')->on('spin_sectors');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_spins');
    }
};
