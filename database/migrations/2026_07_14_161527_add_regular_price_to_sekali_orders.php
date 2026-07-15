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
        Schema::table('sekali_orders', function (Blueprint $table) {
            $table->unsignedBigInteger('regular_price_uzs')->nullable()->after('price_uzs');
        });
    }

    public function down(): void
    {
        Schema::table('sekali_orders', function (Blueprint $table) {
            $table->dropColumn('regular_price_uzs');
        });
    }
};
