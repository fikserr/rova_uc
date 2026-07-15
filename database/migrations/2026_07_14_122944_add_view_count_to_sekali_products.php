<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('sekali_products', 'view_count')) {
            Schema::table('sekali_products', function (Blueprint $table) {
                $table->unsignedBigInteger('view_count')->default(0)->after('stock');
            });
        }
    }

    public function down(): void
    {
        Schema::table('sekali_products', function (Blueprint $table) {
            $table->dropColumn('view_count');
        });
    }
};
