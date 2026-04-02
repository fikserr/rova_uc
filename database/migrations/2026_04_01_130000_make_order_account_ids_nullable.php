<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (Schema::hasTable('uc_orders')) {
            Schema::table('uc_orders', function (Blueprint $table) {
                $table->dropForeign(['pubg_account_id']);
            });

            Schema::table('uc_orders', function (Blueprint $table) {
                $table->unsignedBigInteger('pubg_account_id')->nullable()->change();
            });

            Schema::table('uc_orders', function (Blueprint $table) {
                $table->foreign('pubg_account_id')->references('id')->on('pubg_accounts')->cascadeOnDelete();
            });
        }

        if (Schema::hasTable('ml_orders')) {
            Schema::table('ml_orders', function (Blueprint $table) {
                $table->dropForeign(['ml_account_id']);
            });

            Schema::table('ml_orders', function (Blueprint $table) {
                $table->unsignedBigInteger('ml_account_id')->nullable()->change();
            });

            Schema::table('ml_orders', function (Blueprint $table) {
                $table->foreign('ml_account_id')->references('id')->on('ml_accounts')->cascadeOnDelete();
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('uc_orders')) {
            Schema::table('uc_orders', function (Blueprint $table) {
                $table->dropForeign(['pubg_account_id']);
            });

            Schema::table('uc_orders', function (Blueprint $table) {
                $table->unsignedBigInteger('pubg_account_id')->nullable(false)->change();
            });

            Schema::table('uc_orders', function (Blueprint $table) {
                $table->foreign('pubg_account_id')->references('id')->on('pubg_accounts')->cascadeOnDelete();
            });
        }

        if (Schema::hasTable('ml_orders')) {
            Schema::table('ml_orders', function (Blueprint $table) {
                $table->dropForeign(['ml_account_id']);
            });

            Schema::table('ml_orders', function (Blueprint $table) {
                $table->unsignedBigInteger('ml_account_id')->nullable(false)->change();
            });

            Schema::table('ml_orders', function (Blueprint $table) {
                $table->foreign('ml_account_id')->references('id')->on('ml_accounts')->cascadeOnDelete();
            });
        }
    }
};
