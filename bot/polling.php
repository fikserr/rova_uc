<?php

/**
 * Telegram BOT - POLLING
 * - user_notifications jadvalidan pending xabarlarni yuboradi
 * - Worker callback: buyurtma va topup tasdiqlash/bekor qilish
 */

require __DIR__ . '/../vendor/autoload.php';

$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Schema;

$BOT_TOKEN = config('services.telegram.bot_token') ?: env('TELEGRAM_BOT_TOKEN');
$API_URL   = rtrim(config('app.url'), '/') . '/api';

if (!$BOT_TOKEN) {
    die("TELEGRAM_BOT_TOKEN topilmadi (.env)\n");
}

$offset  = 0;
$botInfo = getBotInfo($BOT_TOKEN);
if ($botInfo['ok']) {
    echo "Bot ishga tushdi: @" . $botInfo['username'] . " (id: " . $botInfo['id'] . ")\n";
} else {
    echo "Bot ishga tushdi, lekin getMe xato: " . $botInfo['error'] . "\n";
}

// ══════════════════════════════════════════════════════════════════
// MAIN LOOP
// ══════════════════════════════════════════════════════════════════

while (true) {
    dispatchPendingNotifications($BOT_TOKEN);

    try {
        $response = Http::timeout(15)->get("https://api.telegram.org/bot{$BOT_TOKEN}/getUpdates", [
            'timeout' => 10,
            'offset'  => $offset,
        ]);
        $updates = $response->json();
    } catch (\Throwable $e) {
        echo "[" . date('H:i:s') . "] getUpdates xato: " . $e->getMessage() . "\n";
        sleep(5);
        continue;
    }

    if (empty($updates['result'])) {
        sleep(1);
        continue;
    }

    foreach ($updates['result'] as $update) {
        $offset = $update['update_id'] + 1;

        // ── Inline tugma bosildi ──────────────────────────────────
        if (isset($update['callback_query'])) {
            handleCallbackQuery($BOT_TOKEN, $update['callback_query']);
            continue;
        }

        if (!isset($update['message'])) {
            continue;
        }

        $message    = $update['message'];
        $chatId     = $message['chat']['id'];
        $from       = $message['from'];
        $telegramId = $from['id'];
        $username   = $from['username'] ?? null;
        $webAppUrl  = rtrim(config('app.url'), '/');

        $dbUser = DB::table('users')->where('id', $telegramId)->first();
        $role   = $dbUser?->role ?? 'guest';

        // ── Worker / Admin ────────────────────────────────────────
        if (in_array($role, ['worker', 'admin'], true)) {
            handleWorkerMessage($BOT_TOKEN, $chatId, $telegramId, $message);
            continue;
        }

        // ── Oddiy foydalanuvchi ───────────────────────────────────

        if (($message['text'] ?? null) === '/start') {
            $apiResponse = Http::post($API_URL . '/users/start', [
                'telegram_id' => $telegramId,
                'username'    => $username,
            ]);
            $data = $apiResponse->json();

            if (!empty($data['need_phone'])) {
                sendMessage(
                    $BOT_TOKEN, $chatId,
                    "Assalomu alaykum!\nDavom etish uchun telefon raqamingizni yuboring.",
                    ['keyboard' => [[[
                        'text'            => 'Telefon raqamni yuborish',
                        'request_contact' => true,
                    ]]],
                        'resize_keyboard'   => true,
                        'one_time_keyboard' => true,
                    ]
                );
            } else {
                $balance = (float) (DB::table('user_balances')
                    ->where('user_id', $telegramId)->value('balance') ?? 0);

                sendMessage($BOT_TOKEN, $chatId,
                    "Xush kelibsiz! 👋\nBalansingiz: " . number_format($balance, 0, '.', ' ') . " so'm",
                    ['inline_keyboard' => [[
                        ['text' => '🛒 Ilovani ochish', 'web_app' => ['url' => $webAppUrl]],
                    ]]]
                );
            }
            continue;
        }

        if (isset($message['contact'])) {
            if ($message['contact']['user_id'] != $telegramId) {
                sendMessage($BOT_TOKEN, $chatId, "Iltimos, o'zingizning telefon raqamingizni yuboring.");
                continue;
            }

            Http::post($API_URL . '/users/phone', [
                'telegram_id'  => $telegramId,
                'phone_number' => $message['contact']['phone_number'],
            ]);

            sendMessage($BOT_TOKEN, $chatId,
                "Ro'yxatdan muvaffaqiyatli o'tdingiz! ✅",
                ['remove_keyboard' => true]
            );
            sendMessage($BOT_TOKEN, $chatId,
                "Ilovani ochish uchun quyidagi tugmani bosing:",
                ['inline_keyboard' => [[
                    ['text' => '🛒 Ilovani ochish', 'web_app' => ['url' => $webAppUrl]],
                ]]]
            );
            continue;
        }

        if (($message['text'] ?? null) === 'Balans') {
            $balance = (float) (DB::table('user_balances')
                ->where('user_id', $telegramId)->value('balance') ?? 0);
            sendMessage($BOT_TOKEN, $chatId,
                "💰 Balansingiz: " . number_format($balance, 0, '.', ' ') . " so'm",
                ['inline_keyboard' => [[
                    ['text' => '🛒 Ilovani ochish', 'web_app' => ['url' => $webAppUrl]],
                ]]]
            );
            continue;
        }

        // ── AI yordamchi (boshqa barcha matn xabarlar) ───────────
        $userText = trim($message['text'] ?? '');
        if ($userText !== '') {
            $aiService = app(\App\Services\OpenAiService::class);
            $reply = $aiService->botAnswer($userText);
            if ($reply !== '') {
                sendMessage($BOT_TOKEN, $chatId, $reply);
            }
        }
    }

    sleep(1);
}

// ══════════════════════════════════════════════════════════════════
// WORKER MESSAGE HANDLER
// ══════════════════════════════════════════════════════════════════

function handleWorkerMessage(string $token, int $chatId, int $workerId, array $message): void
{
    $text  = trim($message['text'] ?? '');
    $state = getBotState($workerId);

    // Sabab kutilayotgan holat (bekor qilish yoki rad etish)
    if ($state) {
        if ($text === '' || $text === '/start') {
            clearBotState($workerId);
            sendMessage($token, $chatId, "✅ Amal bekor qilindi.");
            return;
        }
        handleWorkerState($token, $chatId, $workerId, $text, $state);
        return;
    }

    // /start yoki har qanday xabar — oddiy javob
    sendMessage($token, $chatId,
        "👷 Worker bot faol.\n\nYangi buyurtma yoki chek kelganda siz bu yerda bildirishnoma olasiz."
    );
}

function handleWorkerState(string $token, int $chatId, int $workerId, string $reason, object $state): void
{
    // Limit reason length to prevent oversized DB inserts
    $reason = mb_substr(trim($reason), 0, 500);

    $payload = is_string($state->payload)
        ? json_decode($state->payload, true)
        : (array) $state->payload;

    if ($state->state === 'cancel_reason') {
        $type    = $payload['type'] ?? '';
        $orderId = (int) ($payload['id'] ?? 0);
        clearBotState($workerId);
        if ($orderId > 0 && orderTable($type)) {
            doCancelOrder($token, $chatId, $type, $orderId, $reason);
        }
        return;
    }

    if ($state->state === 'reject_reason') {
        $topupId = (int) ($payload['id'] ?? 0);
        clearBotState($workerId);
        if ($topupId > 0) {
            doRejectTopup($token, $chatId, $topupId, $reason);
        }
        return;
    }

    clearBotState($workerId);
}

// ══════════════════════════════════════════════════════════════════
// CALLBACK QUERY HANDLER
// ══════════════════════════════════════════════════════════════════

function handleCallbackQuery(string $token, array $cb): void
{
    $callbackId = $cb['id'];
    $chatId     = $cb['message']['chat']['id'] ?? 0;
    $workerId   = $cb['from']['id'];
    $data       = $cb['data'] ?? '';

    $dbUser = DB::table('users')->where('id', $workerId)->first();
    $role   = $dbUser?->role ?? 'guest';

    if (!in_array($role, ['worker', 'admin'], true)) {
        answerCallback($token, $callbackId, "❌ Ruxsat yo'q.");
        return;
    }

    answerCallback($token, $callbackId);

    // o:{type}:{action}:{id}  →  o:uc:a:5 / o:ml:c:3 / o:srv:a:7
    if (str_starts_with($data, 'o:')) {
        $parts = explode(':', $data, 4);
        if (count($parts) !== 4) return;
        [, $type, $action, $id] = $parts;
        $orderId = (int) $id;
        if ($orderId <= 0) return;
        if (!in_array($action, ['a', 'c'], true)) return;
        if (!orderTable($type)) return; // unknown type

        if ($action === 'a') {
            doApproveOrder($token, $chatId, $type, $orderId);
        } else {
            setBotState($workerId, 'cancel_reason', ['type' => $type, 'id' => $orderId]);
            sendMessage($token, $chatId,
                "❌ Buyurtma #{$orderId} uchun bekor qilish *sababini* yozing:\n_(Bekor qilish uchun /start yuboring)_"
            );
        }
        return;
    }

    // t:{action}:{id}  →  t:a:12 / t:r:12
    if (str_starts_with($data, 't:')) {
        $parts = explode(':', $data, 3);
        if (count($parts) !== 3) return;
        [, $action, $id] = $parts;
        $topupId = (int) $id;
        if ($topupId <= 0) return;
        if (!in_array($action, ['a', 'r'], true)) return;

        if ($action === 'a') {
            doApproveTopup($token, $chatId, $topupId);
        } else {
            setBotState($workerId, 'reject_reason', ['id' => $topupId]);
            sendMessage($token, $chatId,
                "❌ Chek #{$topupId} uchun rad etish *sababini* yozing:\n_(Bekor qilish uchun /start yuboring)_"
            );
        }
        return;
    }
}

// ══════════════════════════════════════════════════════════════════
// ORDER ACTIONS
// ══════════════════════════════════════════════════════════════════

function doApproveOrder(string $token, int $chatId, string $type, int $orderId): void
{
    $table = orderTable($type);
    if (!$table) { sendMessage($token, $chatId, "❌ Noto'g'ri tur."); return; }

    $order = DB::table($table)->where('id', $orderId)->first();

    if (!$order || !in_array($order->status, ['paid', 'pending'], true)) {
        sendMessage($token, $chatId, "⚠️ Buyurtma #{$orderId} topilmadi yoki allaqachon qayta ishlangan.");
        return;
    }

    DB::table($table)->where('id', $orderId)->update(['status' => 'delivered']);

    createOrderNotification(
        userId:    (int) $order->user_id,
        orderType: orderTypeLabel($type),
        orderId:   $orderId,
        status:    'delivered',
        title:     orderDeliveredTitle($type),
        message:   orderDeliveredMessage($type)
    );

    sendMessage($token, $chatId, "✅ Buyurtma #{$orderId} tasdiqlandi.");
}

function doCancelOrder(string $token, int $chatId, string $type, int $orderId, string $reason): void
{
    $table = orderTable($type);
    if (!$table) { sendMessage($token, $chatId, "❌ Noto'g'ri tur."); return; }

    $order = DB::table($table)->where('id', $orderId)->first();

    if (!$order || !in_array($order->status, ['paid', 'pending'], true)) {
        sendMessage($token, $chatId, "⚠️ Buyurtma #{$orderId} topilmadi yoki allaqachon qayta ishlangan.");
        return;
    }

    DB::transaction(function () use ($table, $order, $orderId, $reason) {
        DB::table($table)->where('id', $orderId)->update(['status' => 'canceled']);

        $refund = (float) ($order->sell_price ?? 0);
        if ($refund > 0) {
            $balanceRow = DB::table('user_balances')
                ->where('user_id', $order->user_id)
                ->lockForUpdate()
                ->first();
            $newBalance = (float) ($balanceRow->balance ?? 0) + $refund;
            DB::table('user_balances')
                ->where('user_id', $order->user_id)
                ->update(['balance' => $newBalance, 'updated_at' => now()]);
        }
    });

    createOrderNotification(
        userId:      (int) $order->user_id,
        orderType:   orderTypeLabel($type),
        orderId:     $orderId,
        status:      'canceled',
        title:       '❌ Buyurtma bekor qilindi',
        message:     "Buyurtmangiz bekor qilindi.",
        description: $reason
    );

    sendMessage($token, $chatId, "✅ Buyurtma #{$orderId} bekor qilindi.");
}

// ══════════════════════════════════════════════════════════════════
// TOPUP ACTIONS
// ══════════════════════════════════════════════════════════════════

function doApproveTopup(string $token, int $chatId, int $topupId): void
{
    $topup = DB::table('manual_topup_requests')->where('id', $topupId)->first();

    if (!$topup || $topup->status !== 'pending') {
        sendMessage($token, $chatId, "⚠️ Chek #{$topupId} topilmadi yoki allaqachon qayta ishlangan.");
        return;
    }

    $amount = (float) $topup->amount;

    DB::transaction(function () use ($topupId, $topup, $amount) {
        DB::table('manual_topup_requests')
            ->where('id', $topupId)
            ->update(['status' => 'approved']);

        $balanceRow = DB::table('user_balances')
            ->where('user_id', $topup->user_id)
            ->lockForUpdate()
            ->first();
        $newBalance = (float) ($balanceRow->balance ?? 0) + $amount;
        DB::table('user_balances')
            ->where('user_id', $topup->user_id)
            ->update(['balance' => $newBalance, 'updated_at' => now()]);
    });

    createTopupNotification(
        userId:  (int) $topup->user_id,
        topupId: $topupId,
        status:  'approved',
        title:   '✅ Balans to\'ldirildi',
        message: number_format($amount, 0, '.', ' ') . " so'm balansingizga qo'shildi."
    );

    sendMessage($token, $chatId,
        "✅ Chek #{$topupId} qabul qilindi. " . number_format($amount, 0, '.', ' ') . " so'm qo'shildi."
    );
}

function doRejectTopup(string $token, int $chatId, int $topupId, string $reason): void
{
    $topup = DB::table('manual_topup_requests')->where('id', $topupId)->first();

    if (!$topup || $topup->status !== 'pending') {
        sendMessage($token, $chatId, "⚠️ Chek #{$topupId} topilmadi yoki allaqachon qayta ishlangan.");
        return;
    }

    DB::table('manual_topup_requests')
        ->where('id', $topupId)
        ->update(['status' => 'rejected', 'notes' => $reason]);

    createTopupNotification(
        userId:      (int) $topup->user_id,
        topupId:     $topupId,
        status:      'rejected',
        title:       '❌ Chek rad etildi',
        message:     "Chekingiz rad etildi.",
        description: $reason
    );

    sendMessage($token, $chatId, "✅ Chek #{$topupId} rad etildi.");
}

// ══════════════════════════════════════════════════════════════════
// NOTIFICATIONS
// ══════════════════════════════════════════════════════════════════

function createOrderNotification(
    int $userId, string $orderType, int $orderId,
    string $status, string $title, string $message, string $description = ''
): void {
    if (!Schema::hasTable('user_notifications')) return;
    DB::table('user_notifications')->insert([
        'user_id'     => $userId,
        'source'      => 'admin',
        'order_type'  => $orderType,
        'order_id'    => $orderId,
        'status'      => $status,
        'title'       => $title,
        'message'     => $message,
        'description' => $description ?: null,
        'is_read'     => false,
        'created_at'  => now(),
    ]);
}

function createTopupNotification(
    int $userId, int $topupId,
    string $status, string $title, string $message, string $description = ''
): void {
    if (!Schema::hasTable('user_notifications')) return;
    DB::table('user_notifications')->insert([
        'user_id'     => $userId,
        'source'      => 'system',
        'order_type'  => null,
        'order_id'    => $topupId,
        'status'      => $status,
        'title'       => $title,
        'message'     => $message,
        'description' => $description ?: null,
        'is_read'     => false,
        'created_at'  => now(),
    ]);
}

// ══════════════════════════════════════════════════════════════════
// BOT STATE
// ══════════════════════════════════════════════════════════════════

function getBotState(int $userId): ?object
{
    if (!Schema::hasTable('bot_states')) return null;
    return DB::table('bot_states')->where('user_id', $userId)->first();
}

function setBotState(int $userId, string $state, array $payload): void
{
    if (!Schema::hasTable('bot_states')) return;
    DB::table('bot_states')->updateOrInsert(
        ['user_id' => $userId],
        ['state' => $state, 'payload' => json_encode($payload)]
    );
}

function clearBotState(int $userId): void
{
    if (!Schema::hasTable('bot_states')) return;
    DB::table('bot_states')->where('user_id', $userId)->delete();
}

// ══════════════════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════════════════

function orderTable(string $type): ?string
{
    return match ($type) {
        'uc'  => 'uc_orders',
        'ml'  => 'ml_orders',
        'srv' => 'service_orders',
        default => null,
    };
}

function orderTypeLabel(string $type): string
{
    return match ($type) {
        'uc'  => 'uc',
        'ml'  => 'ml',
        'srv' => 'service',
        default => $type,
    };
}

function orderDeliveredTitle(string $type): string
{
    return match ($type) {
        'uc'  => 'UC tushdi ✅',
        'ml'  => 'Almaz tushdi ✅',
        'srv' => 'Xizmat bajarildi ✅',
        default => 'Buyurtma bajarildi ✅',
    };
}

function orderDeliveredMessage(string $type): string
{
    return match ($type) {
        'uc'  => 'Buyurtmangiz bajarildi. UC hisobingizga tushirildi.',
        'ml'  => 'Buyurtmangiz bajarildi. Almaz hisobingizga tushirildi.',
        'srv' => 'Buyurtmangiz bajarildi.',
        default => 'Buyurtmangiz bajarildi.',
    };
}

// ══════════════════════════════════════════════════════════════════
// TELEGRAM API
// ══════════════════════════════════════════════════════════════════

function sendMessage(string $token, int $chatId, string $text, ?array $replyMarkup = null): array
{
    $data = [
        'chat_id'    => $chatId,
        'text'       => $text,
        'parse_mode' => 'Markdown',
    ];

    if ($replyMarkup !== null) {
        $data['reply_markup'] = json_encode($replyMarkup);
    }

    try {
        $res = Http::timeout(10)->post("https://api.telegram.org/bot{$token}/sendMessage", $data);
        return ['ok' => ($res->json('ok') === true), 'error' => null];
    } catch (\Throwable $e) {
        return ['ok' => false, 'error' => $e->getMessage()];
    }
}

function answerCallback(string $token, string $callbackId, string $text = ''): void
{
    $data = ['callback_query_id' => $callbackId];
    if ($text !== '') $data['text'] = $text;
    try {
        Http::timeout(5)->post("https://api.telegram.org/bot{$token}/answerCallbackQuery", $data);
    } catch (\Throwable $e) {
        // ignore
    }
}

function getBotInfo(string $token): array
{
    try {
        $res = Http::timeout(10)->get("https://api.telegram.org/bot{$token}/getMe");
        $json = $res->json();
        if (!is_array($json) || !($json['ok'] ?? false)) {
            return ['ok' => false, 'error' => 'invalid response', 'username' => '', 'id' => 0];
        }
        return [
            'ok'       => true,
            'error'    => null,
            'username' => (string) ($json['result']['username'] ?? ''),
            'id'       => (int) ($json['result']['id'] ?? 0),
        ];
    } catch (\Throwable $e) {
        return ['ok' => false, 'error' => $e->getMessage(), 'username' => '', 'id' => 0];
    }
}

function dispatchPendingNotifications(string $botToken): void
{
    if (!Schema::hasTable('user_notifications')) return;

    $rows = DB::table('user_notifications')
        ->whereNull('tg_sent_at')
        ->where('tg_attempts', '<', 10)
        ->orderBy('id')
        ->limit(20)
        ->get();

    foreach ($rows as $row) {
        $title   = trim((string) ($row->title ?? 'Bildirishnoma'));
        $message = trim((string) ($row->message ?? ''));
        $desc    = trim((string) ($row->description ?? ''));

        $text = $title;
        if ($message !== '') $text .= "\n\n" . $message;
        if ($desc !== '')    $text .= "\n\nSabab: " . $desc;

        $result       = sendMessage($botToken, (int) $row->user_id, $text);
        $nextAttempts = (int) ($row->tg_attempts ?? 0) + 1;

        DB::table('user_notifications')->where('id', $row->id)->update(
            $result['ok']
                ? ['tg_sent_at' => now(), 'tg_attempts' => $nextAttempts, 'tg_last_error' => null]
                : ['tg_attempts' => $nextAttempts, 'tg_last_error' => $result['error']]
        );
    }
}
