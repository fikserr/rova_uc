<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TelegramNotificationService
{
    private string $token;
    private string $botApiUrl = 'https://api.telegram.org/bot';

    public function __construct()
    {
        $this->token = config('services.telegram.bot_token', '');
    }

    public function sendMessage(string|int $chatId, string $text, bool $silent = false): bool
    {
        if (empty($this->token) || empty($chatId)) {
            return false;
        }
        try {
            $response = Http::timeout(10)->post("{$this->botApiUrl}{$this->token}/sendMessage", [
                'chat_id' => $chatId,
                'text' => $text,
                'parse_mode' => 'HTML',
                'disable_notification' => $silent,
            ]);
            return $response->successful();
        } catch (\Throwable $e) {
            Log::warning('Telegram send failed', ['error' => $e->getMessage()]);
            return false;
        }
    }

    public function notifyOrderStatus(int $userId, string $orderType, int $orderId, string $status, string $productName = '', ?string $description = null): void
    {
        // Get user's telegram_id from DB
        $user = \Illuminate\Support\Facades\DB::table('users')->where('id', $userId)->first();
        $chatId = $user?->telegram_id ?? null;
        if (!$chatId) return;

        $emoji = match($status) {
            'delivered' => '✅',
            'canceled'  => '❌',
            'paid'      => '🔄',
            default     => 'ℹ️',
        };

        $statusText = match($status) {
            'delivered' => 'Bajarildi',
            'canceled'  => 'Bekor qilindi',
            'paid'      => 'Qabul qilindi',
            default     => $status,
        };

        $typeLabel = match($orderType) {
            'uc'      => 'UC Buyurtma',
            'service' => 'Xizmat',
            'sekali'  => 'SekalıPay',
            default   => 'Buyurtma',
        };

        $text = "{$emoji} <b>{$typeLabel} #{$orderId}</b>\n";
        $text .= "Status: <b>{$statusText}</b>\n";
        if ($productName) $text .= "Mahsulot: {$productName}\n";
        if ($description) $text .= "Izoh: {$description}";

        $this->sendMessage($chatId, trim($text));
    }
}
