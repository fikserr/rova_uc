<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('top_games', function (Blueprint $table) {
            $table->id();
            $table->string('category');
            $table->string('game_name');
            $table->string('image_url')->nullable();
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();
            $table->unique(['category', 'game_name']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('top_games');
    }
};
