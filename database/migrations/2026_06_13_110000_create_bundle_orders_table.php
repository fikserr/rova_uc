<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bundle_orders', function (Blueprint $table) {
            $table->id();
            $table->string('user_id');
            $table->unsignedBigInteger('bundle_id');
            $table->unsignedBigInteger('pubg_account_id')->nullable();
            $table->decimal('sell_price', 15, 2)->default(0);
            $table->string('sell_currency', 10)->default('UZS');
            $table->decimal('cost_price', 15, 2)->default(0);
            $table->string('cost_currency', 10)->default('UZS');
            $table->decimal('profit_base', 15, 2)->default(0);
            $table->string('status', 20)->default('pending');
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bundle_orders');
    }
};
