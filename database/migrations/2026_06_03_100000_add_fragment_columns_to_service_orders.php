<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('service_orders', function (Blueprint $table) {
            if (!Schema::hasColumn('service_orders', 'fragment_order_uuid')) {
                $table->string('fragment_order_uuid')->nullable()->after('status');
            }
            if (!Schema::hasColumn('service_orders', 'fragment_error')) {
                $table->text('fragment_error')->nullable()->after('fragment_order_uuid');
            }
        });
    }

    public function down(): void
    {
        Schema::table('service_orders', function (Blueprint $table) {
            $table->dropColumn(['fragment_order_uuid', 'fragment_error']);
        });
    }
};
