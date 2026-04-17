<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('manual_topup_requests', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->decimal('amount', 12, 2);
            $table->string('photo_file_id', 255);
            $table->string('status', 20)->default('pending'); // pending, approved, rejected
            $table->json('admin_messages')->nullable(); // {admin_telegram_id: message_id}
            $table->text('notes')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index('user_id');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('manual_topup_requests');
    }
};
