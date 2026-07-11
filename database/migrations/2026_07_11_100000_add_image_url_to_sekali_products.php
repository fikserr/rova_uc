<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('sekali_products', function (Blueprint $table) {
            $table->string('image_url', 500)->nullable()->after('product_type');
        });
    }

    public function down(): void
    {
        Schema::table('sekali_products', function (Blueprint $table) {
            $table->dropColumn('image_url');
        });
    }
};
