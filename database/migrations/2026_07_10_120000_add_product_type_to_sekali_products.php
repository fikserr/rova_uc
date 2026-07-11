<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('sekali_products', function (Blueprint $table) {
            $table->string('product_type', 200)->nullable()->after('game_name');
            $table->index('product_type');
        });
    }

    public function down(): void
    {
        Schema::table('sekali_products', function (Blueprint $table) {
            $table->dropIndex(['product_type']);
            $table->dropColumn('product_type');
        });
    }
};
