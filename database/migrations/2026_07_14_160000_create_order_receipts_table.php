<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('order_receipts')) {
            return;
        }

        Schema::create('order_receipts', function (Blueprint $table) {
            $table->id();
            $table->string('order_type', 20);       // sekali, uc, ml, bundle, srv
            $table->string('order_ref', 100);        // UUID (sekali) yoki numeric id
            $table->string('external_ref', 255)->nullable();
            $table->unsignedBigInteger('user_id');
            $table->string('product_name', 255)->nullable();
            $table->decimal('sell_price_uzs', 15, 2)->default(0);  // Mijoz to'lagan narx
            $table->decimal('cost_price_uzs', 15, 2)->default(0);  // Bizning narximiz
            $table->decimal('profit_uzs', 15, 2)->default(0);      // Foyda
            $table->string('status', 20)->default('completed');     // completed, canceled
            $table->timestamp('created_at')->useCurrent();

            $table->index('user_id');
            $table->index(['order_type', 'created_at']);
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_receipts');
    }
};
