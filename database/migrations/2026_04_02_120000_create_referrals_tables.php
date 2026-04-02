<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('referral_settings')) {
            Schema::create('referral_settings', function (Blueprint $table) {
                $table->id();
                $table->decimal('reward_amount', 15, 2)->default(0);
                $table->string('reward_currency')->default('UZS');
                $table->boolean('is_active')->default(true);
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('referrals')) {
            Schema::create('referrals', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('referrer_id');
                $table->unsignedBigInteger('referred_user_id')->unique();
                $table->decimal('reward_amount', 15, 2)->default(0);
                $table->string('reward_currency')->default('UZS');
                $table->timestamp('rewarded_at')->nullable();
                $table->timestamp('created_at')->useCurrent();

                $table->foreign('referrer_id')->references('id')->on('users')->cascadeOnDelete();
                $table->foreign('referred_user_id')->references('id')->on('users')->cascadeOnDelete();
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('referrals')) {
            Schema::dropIfExists('referrals');
        }

        if (Schema::hasTable('referral_settings')) {
            Schema::dropIfExists('referral_settings');
        }
    }
};

