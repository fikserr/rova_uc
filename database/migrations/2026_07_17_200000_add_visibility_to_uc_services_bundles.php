<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('uc_products', function (Blueprint $table) {
            $table->boolean('visible_to_users')     ->default(true)->after('is_active');
            $table->boolean('visible_to_resellers') ->default(true)->after('visible_to_users');
        });

        Schema::table('services', function (Blueprint $table) {
            $table->boolean('visible_to_users')     ->default(true)->after('is_active');
            $table->boolean('visible_to_resellers') ->default(true)->after('visible_to_users');
        });

        Schema::table('uc_bundles', function (Blueprint $table) {
            $table->boolean('visible_to_users')     ->default(true)->after('is_active');
            $table->boolean('visible_to_resellers') ->default(true)->after('visible_to_users');
        });
    }

    public function down(): void
    {
        Schema::table('uc_products', function (Blueprint $table) {
            $table->dropColumn(['visible_to_users', 'visible_to_resellers']);
        });

        Schema::table('services', function (Blueprint $table) {
            $table->dropColumn(['visible_to_users', 'visible_to_resellers']);
        });

        Schema::table('uc_bundles', function (Blueprint $table) {
            $table->dropColumn(['visible_to_users', 'visible_to_resellers']);
        });
    }
};
