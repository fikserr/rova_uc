<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sekali_products', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('sekali_item_id')->unique();
            $table->string('sekali_sku', 100)->nullable();
            $table->string('category', 100)->default('');
            $table->string('game_name', 200)->default('');
            $table->string('name', 200);
            $table->unsignedBigInteger('price_idr');
            $table->unsignedBigInteger('price_uzs')->default(0);
            $table->decimal('markup_percent', 5, 2)->default(20.00);
            $table->string('order_process', 20)->default('auto');
            $table->json('required_fields')->nullable();
            $table->boolean('has_validation')->default(false);
            $table->integer('stock')->default(-1);
            $table->boolean('is_active')->default(true);
            $table->timestamp('synced_at')->nullable();
            $table->timestamps();

            $table->index(['category', 'is_active']);
            $table->index('game_name');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sekali_products');
    }
};
