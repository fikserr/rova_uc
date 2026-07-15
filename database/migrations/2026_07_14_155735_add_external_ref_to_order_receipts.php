<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('order_receipts', function (Blueprint $table) {
            $table->string('external_ref')->nullable()->after('order_ref');
        });
    }

    public function down(): void
    {
        Schema::table('order_receipts', function (Blueprint $table) {
            $table->dropColumn('external_ref');
        });
    }
};
