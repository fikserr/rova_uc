<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (Schema::hasTable('payments')) {
            Schema::table('payments', function (Blueprint $table) {
                if (!Schema::hasColumn('payments', 'currency')) {
                    $table->string('currency')->default('UZS')->after('amount');
                }

                if (!Schema::hasColumn('payments', 'provider')) {
                    $table->string('provider')->default('click')->after('currency');
                }
            });
        }

        if (Schema::hasTable('spin_limits')) {
            Schema::table('spin_limits', function (Blueprint $table) {
                if (!Schema::hasColumn('spin_limits', 'spins_used')) {
                    $table->integer('spins_used')->default(0)->after('user_id');
                }

                if (!Schema::hasColumn('spin_limits', 'last_spin_at')) {
                    $table->timestamp('last_spin_at')->nullable()->after('spins_used');
                }
            });
        }

        if (!Schema::hasTable('pubg_accounts')) {
            Schema::create('pubg_accounts', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('user_id');
                $table->string('pubg_player_id');
                $table->string('pubg_name')->nullable();

                $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
            });
        }

        if (!Schema::hasTable('uc_orders')) {
            Schema::create('uc_orders', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('user_id');
                $table->unsignedBigInteger('pubg_account_id')->nullable();
                $table->unsignedBigInteger('product_id');

                $table->decimal('sell_price', 15, 2);
                $table->string('sell_currency')->default('UZS');

                $table->decimal('cost_price', 15, 4);
                $table->string('cost_currency');

                $table->decimal('profit_base', 15, 2)->default(0);
                $table->string('status')->default('pending');
                $table->timestamp('created_at')->useCurrent();

                $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
                $table->foreign('pubg_account_id')->references('id')->on('pubg_accounts')->cascadeOnDelete();
                $table->foreign('product_id')->references('id')->on('uc_products')->cascadeOnDelete();
            });
        }

        if (!Schema::hasTable('service_orders')) {
            Schema::create('service_orders', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('user_id');
                $table->unsignedBigInteger('service_id');
                $table->unsignedBigInteger('target_telegram_id');

                $table->decimal('sell_price', 15, 2);
                $table->string('sell_currency')->default('UZS');

                $table->decimal('cost_price', 15, 4);
                $table->string('cost_currency');

                $table->decimal('profit_base', 15, 2)->default(0);
                $table->string('status')->default('pending');
                $table->timestamp('created_at')->useCurrent();

                $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
                $table->foreign('service_id')->references('id')->on('services')->cascadeOnDelete();
            });
        }

        if (!Schema::hasTable('ml_orders')) {
            Schema::create('ml_orders', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('user_id');
                $table->unsignedBigInteger('ml_account_id')->nullable();
                $table->unsignedBigInteger('product_id');

                $table->decimal('sell_price', 15, 2);
                $table->string('sell_currency')->default('UZS');

                $table->decimal('cost_price', 15, 4);
                $table->string('cost_currency');

                $table->decimal('profit_base', 15, 2)->default(0);
                $table->string('status')->default('pending');
                $table->timestamp('created_at')->useCurrent();

                $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
                $table->foreign('ml_account_id')->references('id')->on('ml_accounts')->cascadeOnDelete();
                $table->foreign('product_id')->references('id')->on('ml_products')->cascadeOnDelete();
            });
        }

        if (!Schema::hasTable('tasks')) {
            Schema::create('tasks', function (Blueprint $table) {
                $table->id();
                $table->string('title');
                $table->text('description')->nullable();
                $table->string('task_type');
                $table->decimal('reward_amount', 15, 2)->default(0);
                $table->string('reward_currency')->default('UZS');
                $table->boolean('is_repeatable')->default(false);
                $table->boolean('is_active')->default(true);
                $table->timestamp('created_at')->useCurrent();
            });
        }

        if (!Schema::hasTable('user_tasks')) {
            Schema::create('user_tasks', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('user_id');
                $table->unsignedBigInteger('task_id');
                $table->string('status')->default('pending');
                $table->boolean('reward_given')->default(false);
                $table->timestamp('completed_at')->nullable();

                $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
                $table->foreign('task_id')->references('id')->on('tasks')->cascadeOnDelete();
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('user_tasks')) {
            Schema::dropIfExists('user_tasks');
        }

        if (Schema::hasTable('tasks')) {
            Schema::dropIfExists('tasks');
        }

        if (Schema::hasTable('ml_orders')) {
            Schema::dropIfExists('ml_orders');
        }

        if (Schema::hasTable('service_orders')) {
            Schema::dropIfExists('service_orders');
        }

        if (Schema::hasTable('uc_orders')) {
            Schema::dropIfExists('uc_orders');
        }

        if (Schema::hasTable('pubg_accounts')) {
            Schema::dropIfExists('pubg_accounts');
        }

        if (Schema::hasTable('spin_limits')) {
            Schema::table('spin_limits', function (Blueprint $table) {
                if (Schema::hasColumn('spin_limits', 'last_spin_at')) {
                    $table->dropColumn('last_spin_at');
                }

                if (Schema::hasColumn('spin_limits', 'spins_used')) {
                    $table->dropColumn('spins_used');
                }
            });
        }

        if (Schema::hasTable('payments')) {
            Schema::table('payments', function (Blueprint $table) {
                if (Schema::hasColumn('payments', 'provider')) {
                    $table->dropColumn('provider');
                }

                if (Schema::hasColumn('payments', 'currency')) {
                    $table->dropColumn('currency');
                }
            });
        }
    }
};
