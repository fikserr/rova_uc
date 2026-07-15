<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('binance_payments', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->string('merchant_trade_no')->unique();
            $table->string('prepay_id')->nullable();
            $table->unsignedBigInteger('amount_uzs');
            $table->decimal('amount_usdt', 12, 4);
            $table->string('status')->default('pending'); // pending, paid, canceled
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->index(['status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('binance_payments');
    }
};
