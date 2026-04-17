<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('user_notifications')) {
            return;
        }

        Schema::table('user_notifications', function (Blueprint $table) {
            if (!Schema::hasColumn('user_notifications', 'tg_sent_at')) {
                $table->timestamp('tg_sent_at')->nullable()->after('is_read');
            }

            if (!Schema::hasColumn('user_notifications', 'tg_attempts')) {
                $table->unsignedInteger('tg_attempts')->default(0)->after('tg_sent_at');
            }

            if (!Schema::hasColumn('user_notifications', 'tg_last_error')) {
                $table->text('tg_last_error')->nullable()->after('tg_attempts');
            }
        });
    }

    public function down(): void
    {
        if (!Schema::hasTable('user_notifications')) {
            return;
        }

        Schema::table('user_notifications', function (Blueprint $table) {
            $drops = [];
            if (Schema::hasColumn('user_notifications', 'tg_last_error')) {
                $drops[] = 'tg_last_error';
            }
            if (Schema::hasColumn('user_notifications', 'tg_attempts')) {
                $drops[] = 'tg_attempts';
            }
            if (Schema::hasColumn('user_notifications', 'tg_sent_at')) {
                $drops[] = 'tg_sent_at';
            }

            if (!empty($drops)) {
                $table->dropColumn($drops);
            }
        });
    }
};

