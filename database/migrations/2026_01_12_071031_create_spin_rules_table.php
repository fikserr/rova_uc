<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('spin_rules', function (Blueprint $table) {
            $table->id();

            $table->decimal('min_total_deposit', 15, 2);
            // masalan: 100000, 500000

            $table->integer('spins_count');
            // nechta spin beriladi

            $table->boolean('is_active')->default(true);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('spin_rules');
    }
};
