<?php

// database/migrations/xxxx_create_currencies_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('currencies', function (Blueprint $table) {
            $table->string('code')->primary(); // UZS, USD, IQD
            $table->string('name');
            $table->string('symbol')->nullable();
            $table->boolean('is_base')->default(false); // true only for UZS
            $table->boolean('is_active')->default(true);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('currencies');
    }
};
