<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('ml_accounts', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->string('ml_account_id');
            $table->string('ml_server_id');
            $table->string('nickname')->nullable();

            $table->foreign('user_id')->references('id')->on('users');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ml_accounts');
    }
};
