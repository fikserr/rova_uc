<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ReceiptService
{
    private string $token;

    public function __construct()
    {
        $this->token = config('services.telegram.bot_token', '');
    }

    /**
     * Order yakunlanganda chek yozadi va Telegram orqali yuboradi.
     *
     * @param string      $type  sekali | uc | ml | bundle | srv
     * @param string|int  $ref   sekali uchun ref_id (UUID), boshqalar uchun order id
     */
    public function record(string $type, string|int $ref): ?array
    {
        try {
            $data = $this->fetchOrderData($type, $ref);
            if (!$data) return null;

            // Yozilgan chek bo'lsa qayta yozmaslik
            $exists = DB::table('order_receipts')
                ->where('order_type', $type)
                ->where('order_ref', (string) $ref)
                ->exists();
            if ($exists) return null;

            DB::table('order_receipts')->insert([
                'order_type'     => $type,
                'order_ref'      => (string) $ref,
                'external_ref'   => $data['external_ref'] ?? null,
                'user_id'        => $data['user_id'],
                'product_name'   => $data['product_name'],
                'sell_price_uzs' => $data['sell_price_uzs'],
                'cost_price_uzs' => $data['cost_price_uzs'],
                'profit_uzs'     => $data['profit_uzs'],
                'status'         => 'completed',
                'created_at'     => now(),
            ]);

            $this->sendTelegramReceipt($data['user_id'], $type, $ref, $data);

            return $data;
        } catch (\Throwable $e) {
            Log::warning('ReceiptService::record failed', [
                'type'  => $type,
                'ref'   => $ref,
                'error' => $e->getMessage(),
            ]);
            return null;
        }
    }

    private function fetchOrderData(string $type, string|int $ref): ?array
    {
        return match ($type) {
            'sekali' => $this->fetchSekaliOrder((string) $ref),
            'uc'     => $this->fetchUcOrder((int) $ref),
            'ml'     => $this->fetchMlOrder((int) $ref),
            'bundle' => $this->fetchBundleOrder((int) $ref),
            'srv'    => $this->fetchServiceOrder((int) $ref),
            default  => null,
        };
    }

    // ─── Sekali ─────────────────────────────────────────────────

    private function fetchSekaliOrder(string $refId): ?array
    {
        $order = DB::table('sekali_orders')->where('ref_id', $refId)->first();
        if (!$order) return null;

        $product = DB::table('sekali_products')->where('id', $order->sekali_product_id)->first();
        $productName = $product ? ($product->game_name . ' — ' . $product->name) : 'SekalıPay';

        $sellUzs  = (float) ($order->price_uzs ?? 0);
        $priceIdr = (float) ($order->price_idr ?? 0);

        $idrRate = (float) DB::table('currency_rates')
            ->where('currency_code', 'IDR')
            ->orderByDesc('id')
            ->value('rate_to_base');

        $costUzs   = $idrRate > 0 ? round($priceIdr * $idrRate, 2) : 0;
        $profitUzs = round($sellUzs - $costUzs, 2);

        return [
            'user_id'        => (int) $order->user_id,
            'product_name'   => $productName,
            'sell_price_uzs' => $sellUzs,
            'cost_price_uzs' => $costUzs,
            'profit_uzs'     => $profitUzs,
            'external_ref'   => $order->sekali_invoice ?? null,
        ];
    }

    // ─── UC ─────────────────────────────────────────────────────

    private function fetchUcOrder(int $id): ?array
    {
        $order = DB::table('uc_orders')->where('id', $id)->first();
        if (!$order) return null;

        $product = DB::table('uc_products')->where('id', $order->product_id)->first();
        $uc      = $product ? (int) $product->uc_amount : 0;
        $bonus   = $product ? (int) ($product->bonus ?? 0) : 0;
        $name    = 'PUBG Mobile UC — ' . $uc . ' UC' . ($bonus ? " +{$bonus}" : '');

        $sellUzs   = (float) ($order->sell_price ?? 0);
        $profitUzs = (float) ($order->profit_base ?? 0);
        $costUzs   = round($sellUzs - $profitUzs, 2);

        return [
            'user_id'        => (int) $order->user_id,
            'product_name'   => $name,
            'sell_price_uzs' => $sellUzs,
            'cost_price_uzs' => $costUzs,
            'profit_uzs'     => $profitUzs,
        ];
    }

    // ─── ML ─────────────────────────────────────────────────────

    private function fetchMlOrder(int $id): ?array
    {
        $order = DB::table('ml_orders')->where('id', $id)->first();
        if (!$order) return null;

        $product = DB::table('ml_products')->where('id', $order->product_id ?? 0)->first();
        $name    = $product ? ('MLBB — ' . ($product->title ?? $product->name ?? 'Almaz')) : 'Mobile Legends Almaz';

        $sellUzs   = (float) ($order->sell_price ?? 0);
        $profitUzs = (float) ($order->profit_base ?? 0);
        $costUzs   = round($sellUzs - $profitUzs, 2);

        return [
            'user_id'        => (int) $order->user_id,
            'product_name'   => $name,
            'sell_price_uzs' => $sellUzs,
            'cost_price_uzs' => $costUzs,
            'profit_uzs'     => $profitUzs,
        ];
    }

    // ─── Bundle ─────────────────────────────────────────────────

    private function fetchBundleOrder(int $id): ?array
    {
        $order = DB::table('bundle_orders')->where('id', $id)->first();
        if (!$order) return null;

        $bundle = DB::table('uc_bundles')->where('id', $order->bundle_id)->first();
        $name   = $bundle ? ('To\'plam — ' . $bundle->title) : "To'plam #{$id}";

        $sellUzs   = (float) ($order->sell_price ?? 0);
        $profitUzs = (float) ($order->profit_base ?? 0);
        $costUzs   = round($sellUzs - $profitUzs, 2);

        return [
            'user_id'        => (int) $order->user_id,
            'product_name'   => $name,
            'sell_price_uzs' => $sellUzs,
            'cost_price_uzs' => $costUzs,
            'profit_uzs'     => $profitUzs,
        ];
    }

    // ─── Service ─────────────────────────────────────────────────

    private function fetchServiceOrder(int $id): ?array
    {
        $order = DB::table('service_orders')->where('id', $id)->first();
        if (!$order) return null;

        $service = DB::table('services')->where('id', $order->service_id ?? 0)->first();
        $name    = $service ? ($service->title ?? $service->name ?? 'Xizmat') : "Xizmat #{$id}";

        $sellUzs   = (float) ($order->sell_price ?? 0);
        $profitUzs = (float) ($order->profit_base ?? 0);
        $costUzs   = round($sellUzs - $profitUzs, 2);

        return [
            'user_id'        => (int) $order->user_id,
            'product_name'   => $name,
            'sell_price_uzs' => $sellUzs,
            'cost_price_uzs' => $costUzs,
            'profit_uzs'     => $profitUzs,
        ];
    }

    // ─── Telegram ────────────────────────────────────────────────

    private function sendTelegramReceipt(int $userId, string $type, string|int $ref, array $data): void
    {
        if (empty($this->token) || $userId <= 0) return;

        $typeEmoji = match ($type) {
            'sekali' => '⚡',
            'uc'     => '🎮',
            'ml'     => '💎',
            'bundle' => '🎁',
            'srv'    => '⭐',
            default  => '📦',
        };

        $orderNo = match ($type) {
            'sekali' => 'SK-' . strtoupper(substr((string) $ref, 0, 8)),
            'uc'     => 'UC-' . $ref,
            'ml'     => 'ML-' . $ref,
            'bundle' => 'BN-' . $ref,
            'srv'    => 'SV-' . $ref,
            default  => '#' . $ref,
        };

        $sell   = number_format((float) $data['sell_price_uzs'], 0, '.', ' ');
        $date   = now()->timezone('Asia/Tashkent')->format('d.m.Y, H:i');

        $text  = "🧾 <b>BUYURTMA CHEKI</b>\n";
        $text .= "━━━━━━━━━━━━━━━━━━━━━\n";
        $text .= "{$typeEmoji} <b>Xizmat:</b> {$data['product_name']}\n";
        $text .= "🔖 <b>Buyurtma №:</b> {$orderNo}\n";
        if (!empty($data['external_ref'])) {
            $text .= "🧾 <b>SekalıPay №:</b> <code>{$data['external_ref']}</code>\n";
        }
        $text .= "💰 <b>To'langan:</b> {$sell} UZS\n";
        $text .= "📅 <b>Sana:</b> {$date}\n";
        $text .= "━━━━━━━━━━━━━━━━━━━━━\n";
        $text .= "✅ <b>Muvaffaqiyatli bajarildi</b>\n";
        $text .= "<i>Rova UC xizmatidan foydalanganingiz uchun rahmat!</i>";

        try {
            Http::timeout(10)->post("https://api.telegram.org/bot{$this->token}/sendMessage", [
                'chat_id'    => $userId,
                'text'       => $text,
                'parse_mode' => 'HTML',
            ]);
        } catch (\Throwable $e) {
            Log::warning('ReceiptService: Telegram chek yuborishda xato', ['error' => $e->getMessage()]);
        }
    }
}
