<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('user_notifications')) {
            return;
        }

        Schema::create('user_notifications', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->string('source', 50)->default('admin');
            $table->string('order_type', 20)->nullable();
            $table->unsignedBigInteger('order_id')->nullable();
            $table->string('status', 30)->nullable();
            $table->string('title');
            $table->text('message')->nullable();
            $table->text('description')->nullable();
            $table->boolean('is_read')->default(false);
            $table->timestamp('created_at')->useCurrent();

            $table->index(['user_id', 'created_at']);
            $table->index(['order_type', 'order_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_notifications');
    }
};

