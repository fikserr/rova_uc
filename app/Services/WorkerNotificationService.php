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
            'bundle'  => 'bnd',
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

        $text = "💳 Yangi chek so'rovi #{$topup->id}\n"
              . "👤 {$user}\n"
              . "💰 Miqdor: {$amount} so'm";

        $keyboard = ['inline_keyboard' => [[
            ['text' => '✅ Qabul qilish', 'callback_data' => "t:a:{$topupId}"],
            ['text' => '❌ Rad etish',    'callback_data' => "t:r:{$topupId}"],
        ]]];

        foreach ($workerIds as $workerId) {
            $wid = (int) $workerId;
            if (!empty($topup->photo_file_id)) {
                $msgId = self::sendPhotoFile($token, $wid, $topup->photo_file_id, $text, $keyboard);
                if (!$msgId) {
                    $msgId = self::send($token, $wid, $text, $keyboard);
                }
            } else {
                $msgId = self::send($token, $wid, $text, $keyboard);
            }
            if ($msgId > 0) {
                try {
                    DB::statement(
                        "INSERT IGNORE INTO worker_notification_messages (type, ref_id, worker_id, chat_id, message_id, created_at) VALUES ('topup', {$topupId}, {$wid}, {$wid}, {$msgId}, NOW())"
                    );
                } catch (\Throwable $e) {
                    Log::warning('worker_notification_messages table missing: ' . $e->getMessage());
                }
            }
        }
    }

    public static function editTopupMessages(int $topupId, string $text): void
    {
        $token = self::token();
        if (!$token) return;

        try {
            $rows = DB::select("SELECT chat_id, message_id FROM worker_notification_messages WHERE type = 'topup' AND ref_id = {$topupId}");
        } catch (\Throwable $e) {
            return;
        }
        foreach ($rows as $row) {
            try {
                // editMessageReplyMarkup works for both text and photo messages
                Http::timeout(5)->asForm()->post("https://api.telegram.org/bot{$token}/editMessageReplyMarkup", [
                    'chat_id'      => (string) $row->chat_id,
                    'message_id'   => (int) $row->message_id,
                    'reply_markup' => json_encode(['inline_keyboard' => []]),
                ]);
            } catch (\Throwable $e) {
                Log::warning('editTopupMessages failed: ' . $e->getMessage());
            }
        }

        // Send status update as a new message to all workers/admins
        $workerIds = self::workerIds();
        foreach ($workerIds as $workerId) {
            try {
                Http::timeout(5)->asForm()->post("https://api.telegram.org/bot{$token}/sendMessage", [
                    'chat_id' => (string) $workerId,
                    'text'    => $text,
                ]);
            } catch (\Throwable $e) {
                // ignore
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

            'bundle' => DB::table('bundle_orders as o')
                ->leftJoin('users as u', 'u.id', '=', 'o.user_id')
                ->leftJoin('uc_bundles as b', 'b.id', '=', 'o.bundle_id')
                ->leftJoin('pubg_accounts as a', 'a.id', '=', 'o.pubg_account_id')
                ->where('o.id', $orderId)
                ->select('o.sell_price', 'u.username', 'u.id as uid', 'b.title as product', 'a.pubg_player_id as account')
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
            'bundle'  => '🎁',
            default   => '📦',
        };
        $label = match ($type) {
            'uc'      => 'UC',
            'ml'      => 'ML Diamond',
            'service' => 'Service',
            'bundle'  => "To'plam",
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
            'uc'      => "🎮 PUBG ID: {$account}",
            'ml'      => "🎮 ML ID: {$account}",
            'service' => "📨 Target: @{$account}",
            'bundle'  => "🎮 PUBG ID: {$account}",
            default   => "ID: {$account}",
        };

        return "{$emoji} Yangi {$label} buyurtma #{$orderId}\n"
             . "👤 {$user}\n"
             . "{$accountLabel}\n"
             . "🛍️ {$product}\n"
             . "💰 {$amount} so'm";
    }

    private static function send(string $token, int $chatId, string $text, array $keyboard): int
    {
        try {
            $res = Http::asForm()->post("https://api.telegram.org/bot{$token}/sendMessage", [
                'chat_id'      => $chatId,
                'text'         => $text,
                'reply_markup' => json_encode($keyboard),
            ]);
            return (int) ($res->json('result.message_id') ?? 0);
        } catch (\Throwable $e) {
            Log::warning("WorkerNotificationService: sendMessage failed", [
                'chat_id' => $chatId,
                'error'   => $e->getMessage(),
            ]);
            return 0;
        }
    }

    private static function sendPhotoFile(string $token, int $chatId, string $storagePath, string $caption, array $keyboard): int
    {
        try {
            if (!Storage::disk('public')->exists($storagePath)) {
                return 0;
            }

            $fileContents = Storage::disk('public')->get($storagePath);
            $filename     = basename($storagePath);

            $res = Http::attach('photo', $fileContents, $filename, ['Content-Type' => 'image/jpeg'])
                ->post("https://api.telegram.org/bot{$token}/sendPhoto", [
                    'chat_id'      => $chatId,
                    'caption'      => $caption,
                    'reply_markup' => json_encode($keyboard),
                ]);

            return ($res->json('ok') === true) ? (int) ($res->json('result.message_id') ?? 0) : 0;
        } catch (\Throwable $e) {
            Log::warning("WorkerNotificationService: sendPhotoFile failed", ['error' => $e->getMessage()]);
            return 0;
        }
    }
}
