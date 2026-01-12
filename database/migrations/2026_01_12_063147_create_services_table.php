<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('services', function (Blueprint $table) {
            $table->id();

            $table->string('title'); 
            // Masalan: "25 Stars", "Premium 3 oy"

            $table->enum('service_type', ['stars', 'premium']);
            // stars | premium

            $table->integer('value');
            // stars soni yoki premium oylar

            $table->decimal('sell_price', 15, 2);
            $table->string('sell_currency')->default('UZS');

            $table->decimal('cost_price', 15, 4);
            $table->string('cost_currency');
            // USD | IQD

            $table->boolean('is_active')->default(true);

            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('services');
    }
};
