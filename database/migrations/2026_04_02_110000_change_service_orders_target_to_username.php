<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('service_orders')) {
            return;
        }

        Schema::table('service_orders', function (Blueprint $table) {
            $table->string('target_telegram_id', 64)->nullable()->change();
        });
    }

    public function down(): void
    {
        if (!Schema::hasTable('service_orders')) {
            return;
        }

        Schema::table('service_orders', function (Blueprint $table) {
            $table->unsignedBigInteger('target_telegram_id')->nullable()->change();
        });
    }
};

