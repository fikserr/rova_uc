<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class WorkerNotificationService
{
    private static function token(): string
    {
        return config('services.telegram.bot_token') ?: (string) env('TELEGRAM_BOT_TOKEN', '');
    }

    private static function workerIds(): array
    {
        return DB::table('users')
            ->whereIn('role', ['worker', 'admin'])
            ->where('is_blocked', false)
            ->pluck('id')
            ->toArray();
    }

    // ── Yangi order (uc / ml / service) ─────────────────────────────

    public static function notifyNewOrder(string $orderType, int $orderId): void
    {
        $token = self::token();
        if (!$token) return;

        $workerIds = self::workerIds();
        if (empty($workerIds)) return;

        $detail = self::fetchOrderDetail($orderType, $orderId);
        $text   = self::buildOrderText($orderType, $orderId, $detail);

        $typeShort = match ($orderType) {
            'uc'      => 'uc',
            'ml'      => 'ml',
            'service' => 'srv',
            default   => 'uc',
        };

        $keyboard = ['inline_keyboard' => [[
            ['text' => '✅ Tasdiqlash',    'callback_data' => "o:{$typeShort}:a:{$orderId}"],
            ['text' => '❌ Bekor qilish',  'callback_data' => "o:{$typeShort}:c:{$orderId}"],
        ]]];

        foreach ($workerIds as $workerId) {
            self::send($token, (int) $workerId, $text, $keyboard);
        }
    }

    // ── Yangi topup (manual chek) ────────────────────────────────────

    public static function notifyNewTopup(int $topupId): void
    {
        $token = self::token();
        if (!$token) return;

        $workerIds = self::workerIds();
        if (empty($workerIds)) return;

        $topup = DB::table('manual_topup_requests as t')
            ->leftJoin('users as u', 'u.id', '=', 't.user_id')
            ->where('t.id', $topupId)
            ->select('t.id', 't.amount', 't.photo_file_id', 'u.username', 'u.id as uid')
            ->first();

        if (!$topup) return;

        $user   = $topup->username ? "@{$topup->username}" : "User #{$topup->uid}";
        $amount = number_format((float) $topup->amount, 0, '.', ' ');

        $text = "💳 *Yangi chek so'rovi #{$topup->id}*\n"
              . "👤 {$user}\n"
              . "💰 Miqdor: *{$amount} so'm*";

        $keyboard = ['inline_keyboard' => [[
            ['text' => '✅ Qabul qilish', 'callback_data' => "t:a:{$topupId}"],
            ['text' => '❌ Rad etish',    'callback_data' => "t:r:{$topupId}"],
        ]]];

        foreach ($workerIds as $workerId) {
            if (!empty($topup->photo_file_id)) {
                $sent = self::sendPhotoFile($token, (int) $workerId, $topup->photo_file_id, $text, $keyboard);
                if (!$sent) {
                    self::send($token, (int) $workerId, $text, $keyboard);
                }
            } else {
                self::send($token, (int) $workerId, $text, $keyboard);
            }
        }
    }

    // ── Private helpers ──────────────────────────────────────────────

    private static function fetchOrderDetail(string $type, int $orderId): ?object
    {
        return match ($type) {
            'uc' => DB::table('uc_orders as o')
                ->leftJoin('users as u', 'u.id', '=', 'o.user_id')
                ->leftJoin('uc_products as p', 'p.id', '=', 'o.product_id')
                ->leftJoin('pubg_accounts as a', 'a.id', '=', 'o.pubg_account_id')
                ->where('o.id', $orderId)
                ->select('o.sell_price', 'u.username', 'u.id as uid', 'p.title as product', 'a.pubg_player_id as account')
                ->first(),

            'ml' => DB::table('ml_orders as o')
                ->leftJoin('users as u', 'u.id', '=', 'o.user_id')
                ->leftJoin('ml_products as p', 'p.id', '=', 'o.product_id')
                ->leftJoin('ml_accounts as a', 'a.id', '=', 'o.ml_account_id')
                ->where('o.id', $orderId)
                ->select('o.sell_price', 'u.username', 'u.id as uid', 'p.title as product', 'a.ml_account_id as account')
                ->first(),

            'service' => DB::table('service_orders as o')
                ->leftJoin('users as u', 'u.id', '=', 'o.user_id')
                ->leftJoin('services as s', 's.id', '=', 'o.service_id')
                ->where('o.id', $orderId)
                ->select('o.sell_price', 'u.username', 'u.id as uid', 's.title as product', 'o.target_telegram_id as account')
                ->first(),

            default => null,
        };
    }

    private static function buildOrderText(string $type, int $orderId, ?object $d): string
    {
        $emoji = match ($type) {
            'uc'      => '📦',
            'ml'      => '💎',
            'service' => '⭐',
            default   => '📦',
        };
        $label = match ($type) {
            'uc'      => 'UC',
            'ml'      => 'ML Diamond',
            'service' => 'Service',
            default   => strtoupper($type),
        };

        if (!$d) {
            return "{$emoji} *Yangi {$label} buyurtma #{$orderId}*";
        }

        $user    = $d->username ? "@{$d->username}" : "User #{$d->uid}";
        $amount  = number_format((float) ($d->sell_price ?? 0), 0, '.', ' ');
        $product = $d->product ?? '-';
        $account = $d->account ?? '-';

        $accountLabel = match ($type) {
            'uc'      => "🎮 PUBG ID: `{$account}`",
            'ml'      => "🎮 ML ID: `{$account}`",
            'service' => "📨 Target: @{$account}",
            default   => "ID: `{$account}`",
        };

        return "{$emoji} *Yangi {$label} buyurtma #{$orderId}*\n"
             . "👤 {$user}\n"
             . "{$accountLabel}\n"
             . "🛍️ {$product}\n"
             . "💰 {$amount} so'm";
    }

    private static function send(string $token, int $chatId, string $text, array $keyboard): void
    {
        try {
            Http::asForm()->post("https://api.telegram.org/bot{$token}/sendMessage", [
                'chat_id'      => $chatId,
                'text'         => $text,
                'parse_mode'   => 'Markdown',
                'reply_markup' => json_encode($keyboard),
            ]);
        } catch (\Throwable $e) {
            Log::warning("WorkerNotificationService: sendMessage failed", [
                'chat_id' => $chatId,
                'error'   => $e->getMessage(),
            ]);
        }
    }

    private static function sendPhotoFile(string $token, int $chatId, string $storagePath, string $caption, array $keyboard): bool
    {
        try {
            if (!Storage::disk('public')->exists($storagePath)) {
                return false;
            }

            $fileContents = Storage::disk('public')->get($storagePath);
            $filename     = basename($storagePath);
            $mimeType     = Storage::disk('public')->mimeType($storagePath) ?: 'image/jpeg';

            $res = Http::attach('photo', $fileContents, $filename, ['Content-Type' => $mimeType])
                ->post("https://api.telegram.org/bot{$token}/sendPhoto", [
                    'chat_id'      => $chatId,
                    'caption'      => $caption,
                    'parse_mode'   => 'Markdown',
                    'reply_markup' => json_encode($keyboard),
                ]);

            return ($res->json('ok') === true);
        } catch (\Throwable $e) {
            Log::warning("WorkerNotificationService: sendPhotoFile failed", ['error' => $e->getMessage()]);
            return false;
        }
    }
}
