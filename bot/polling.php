<?php

/**
 * Telegram BOT - POLLING
 * - user_notifications jadvalidan pending xabarlarni yuboradi
 */

require __DIR__ . '/../vendor/autoload.php';

$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Schema;

$BOT_TOKEN = env('TELEGRAM_BOT_TOKEN');
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

while (true) {
    dispatchPendingNotifications($BOT_TOKEN);

    $response = file_get_contents(
        "https://api.telegram.org/bot{$BOT_TOKEN}/getUpdates?" .
        http_build_query(['timeout' => 10, 'offset' => $offset])
    );

    $updates = json_decode($response, true);

    if (empty($updates['result'])) {
        sleep(1);
        continue;
    }

    foreach ($updates['result'] as $update) {
        $offset = $update['update_id'] + 1;

        if (!isset($update['message'])) {
            continue;
        }

        $message    = $update['message'];
        $chatId     = $message['chat']['id'];
        $from       = $message['from'];
        $telegramId = $from['id'];
        $username   = $from['username'] ?? null;

        // /start
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
                    "Xush kelibsiz! 👋\nBalansingiz: " . number_format($balance, 0, '.', ' ') . " so'm"
                );
            }
            continue;
        }

        // Telefon raqam
        if (isset($message['contact'])) {
            if ($message['contact']['user_id'] != $telegramId) {
                sendMessage($BOT_TOKEN, $chatId, "Iltimos, o'zingizning telefon raqamingizni yuboring.");
                continue;
            }

            Http::post($API_URL . '/users/phone', [
                'telegram_id'  => $telegramId,
                'phone_number' => $message['contact']['phone_number'],
            ]);

            sendMessage($BOT_TOKEN, $chatId, "Ro'yxatdan muvaffaqiyatli o'tdingiz! ✅");
            continue;
        }

        // Balans
        if (($message['text'] ?? null) === 'Balans') {
            $balance = (float) (DB::table('user_balances')
                ->where('user_id', $telegramId)->value('balance') ?? 0);
            sendMessage($BOT_TOKEN, $chatId,
                "💰 Balansingiz: " . number_format($balance, 0, '.', ' ') . " so'm"
            );
        }
    }

    sleep(1);
}

// ══════════════════════════════════════════════════════════════════

function sendMessage(string $token, int $chatId, string $text, ?array $replyMarkup = null): array
{
    $data = ['chat_id' => $chatId, 'text' => $text];

    if ($replyMarkup !== null) {
        $data['reply_markup'] = json_encode($replyMarkup);
    }

    $url = "https://api.telegram.org/bot{$token}/sendMessage?" . http_build_query($data);
    $raw = @file_get_contents($url);

    if ($raw === false) {
        $error = error_get_last();
        return ['ok' => false, 'error' => $error['message'] ?? 'sendMessage failed'];
    }

    $json = json_decode($raw, true);
    if (!is_array($json) || !($json['ok'] ?? false)) {
        return ['ok' => false, 'error' => is_array($json) ? json_encode($json) : 'invalid response'];
    }

    return ['ok' => true, 'error' => null];
}

function getBotInfo(string $token): array
{
    $raw = @file_get_contents("https://api.telegram.org/bot{$token}/getMe");
    if ($raw === false) {
        $error = error_get_last();
        return ['ok' => false, 'error' => $error['message'] ?? 'getMe failed', 'username' => '', 'id' => 0];
    }

    $json = json_decode($raw, true);
    if (!is_array($json) || !($json['ok'] ?? false)) {
        return ['ok' => false, 'error' => 'invalid getMe response', 'username' => '', 'id' => 0];
    }

    return [
        'ok'       => true,
        'error'    => null,
        'username' => (string) ($json['result']['username'] ?? ''),
        'id'       => (int) ($json['result']['id'] ?? 0),
    ];
}

function dispatchPendingNotifications(string $botToken): void
{
    if (!Schema::hasTable('user_notifications')) {
        return;
    }

    $rows = DB::table('user_notifications')
        ->whereNull('tg_sent_at')
        ->where('tg_attempts', '<', 10)
        ->orderBy('id')
        ->limit(20)
        ->get();

    foreach ($rows as $row) {
        $text   = buildNotificationText($row);
        $result = sendMessage($botToken, (int) $row->user_id, $text);

        $nextAttempts = (int) ($row->tg_attempts ?? 0) + 1;

        if ($result['ok']) {
            DB::table('user_notifications')->where('id', $row->id)->update([
                'tg_sent_at'    => now(),
                'tg_attempts'   => $nextAttempts,
                'tg_last_error' => null,
            ]);
        } else {
            DB::table('user_notifications')->where('id', $row->id)->update([
                'tg_attempts'   => $nextAttempts,
                'tg_last_error' => $result['error'],
            ]);
        }
    }
}

function buildNotificationText(object $row): string
{
    $title       = trim((string) ($row->title ?? 'Bildirishnoma'));
    $message     = trim((string) ($row->message ?? ''));
    $description = trim((string) ($row->description ?? ''));

    $text = $title;
    if ($message !== '') {
        $text .= "\n\n" . $message;
    }
    if ($description !== '') {
        $text .= "\n\nSabab: " . $description;
    }

    return $text;
}
