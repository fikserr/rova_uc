<?php
// database/migrations/xxxx_create_currency_rates_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('currency_rates', function (Blueprint $table) {
            $table->id();
            $table->string('currency_code');
            $table->decimal('rate_to_base', 15, 4); // 1 USD = 12500 UZS
            $table->timestamp('created_at')->useCurrent();

            $table->foreign('currency_code')
                ->references('code')
                ->on('currencies');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('currency_rates');
    }
};
