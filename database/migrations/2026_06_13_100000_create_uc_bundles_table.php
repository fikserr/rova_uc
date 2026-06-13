<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('uc_bundles', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('image_path')->nullable();
            $table->decimal('sell_price', 15, 2)->default(0);
            $table->string('sell_currency', 10)->default('UZS');
            $table->decimal('cost_price', 15, 2)->default(0);
            $table->string('cost_currency', 10)->default('UZS');
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('uc_bundles');
    }
};
