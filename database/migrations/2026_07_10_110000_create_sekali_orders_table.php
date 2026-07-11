<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sekali_orders', function (Blueprint $table) {
            $table->id();
            $table->string('ref_id', 36)->unique();
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('sekali_product_id');
            $table->string('game_target', 200);
            $table->string('zone_id', 100)->nullable();
            $table->unsignedInteger('quantity')->default(1);
            $table->unsignedBigInteger('price_uzs');
            $table->unsignedBigInteger('price_idr');
            $table->string('status', 30)->default('pending');
            $table->string('sekali_invoice', 100)->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
            $table->foreign('sekali_product_id')->references('id')->on('sekali_products');
            $table->index(['user_id', 'created_at']);
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sekali_orders');
    }
};
