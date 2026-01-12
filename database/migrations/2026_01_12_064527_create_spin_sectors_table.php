<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('spin_sectors', function (Blueprint $table) {
            $table->id();
            $table->string('title'); // Masalan: "5000 so‘m", "10 UC"
            $table->enum('reward_type', ['balance', 'pubg', 'none']);
            $table->decimal('reward_value', 15, 2)->default(0);
            $table->integer('probability'); // weight
            $table->boolean('is_active')->default(true);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('spin_sectors');
    }
};
