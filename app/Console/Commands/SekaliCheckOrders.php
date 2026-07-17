<?php

namespace App\Console\Commands;

use App\Models\SekaliOrder;
use App\Services\ReceiptService;
use App\Services\SekaliPayService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class SekaliCheckOrders extends Command
{
    protected $signature   = 'sekali:check-orders';
    protected $description = 'Processing holatidagi SekalıPay orderlarni tekshirish';

    private const COMPLETED_STATUSES = ['completed', 'success', 'delivered', 'paid'];
    private const FAILED_STATUSES    = ['canceled', 'failed', 'refunded'];

    public function handle(SekaliPayService $api): int
    {
        $orders = SekaliOrder::whereIn('status', ['pending', 'processing'])
            ->where('created_at', '>=', now()->subHours(24))
            ->get();

        if ($orders->isEmpty()) {
            $this->info('Tekshiriladigan order yo\'q.');
            return 0;
        }

        $this->info("Tekshirilmoqda: {$orders->count()} order...");

        foreach ($orders as $order) {
            try {
                $result = $api->getTransaction($order->ref_id);

                if (!$result['success']) {
                    $this->warn("Order #{$order->id} — API javob bermadi.");
                    continue;
                }

                $data    = $result['data'];
                $status  = $data['status'] ?? null;
                $invoice = $data['invoice'] ?? null;

                if (in_array($status, self::COMPLETED_STATUSES)) {
                    $this->completeOrder($order, $invoice);
                    $this->info("Order #{$order->id} — completed ✓");
                } elseif (in_array($status, self::FAILED_STATUSES)) {
                    $this->cancelOrder($order);
                    $this->info("Order #{$order->id} — canceled, balans qaytarildi.");
                } else {
                    $this->line("Order #{$order->id} — hali {$status}.");
                }
            } catch (\Throwable $e) {
                Log::error("SekaliCheckOrders: order #{$order->id} tekshirishda xato", ['error' => $e->getMessage()]);
                $this->error("Order #{$order->id} — xato: " . $e->getMessage());
            }
        }

        return 0;
    }

    private function completeOrder(SekaliOrder $order, ?string $invoice): void
    {
        DB::transaction(function () use ($order, $invoice) {
            $fresh = SekaliOrder::where('id', $order->id)->lockForUpdate()->first();
            if (!$fresh || $fresh->status === 'completed') return;

            $fresh->update([
                'status'         => 'completed',
                'sekali_invoice' => $invoice ?? $fresh->sekali_invoice,
            ]);
        });

        app(ReceiptService::class)->record('sekali', $order->ref_id);
    }

    private function cancelOrder(SekaliOrder $order): void
    {
        DB::transaction(function () use ($order) {
            $fresh = SekaliOrder::where('id', $order->id)->lockForUpdate()->first();
            if (!$fresh || in_array($fresh->status, ['completed', 'canceled'])) return;

            DB::table('user_balances')
                ->where('user_id', $fresh->user_id)
                ->increment('balance', $fresh->price_uzs);

            $fresh->update(['status' => 'canceled']);
        });
    }
}
