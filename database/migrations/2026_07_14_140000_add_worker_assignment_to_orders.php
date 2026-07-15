<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('uc_orders', function (Blueprint $table) {
            $table->bigInteger('assigned_worker_id')->nullable();
        });

        Schema::table('service_orders', function (Blueprint $table) {
            $table->bigInteger('assigned_worker_id')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('uc_orders', function (Blueprint $table) {
            $table->dropColumn('assigned_worker_id');
        });

        Schema::table('service_orders', function (Blueprint $table) {
            $table->dropColumn('assigned_worker_id');
        });
    }
};
