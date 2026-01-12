<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('spin_limits', function (Blueprint $table) {
            $table->unsignedBigInteger('user_id')->primary();
            $table->integer('spins_today')->default(0);
            $table->date('last_spin_date')->nullable();

            $table->foreign('user_id')->references('id')->on('users');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('spin_limits');
    }
};
