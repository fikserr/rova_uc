<?php

/**
 * Telegram BOT — POLLING (Webhook yo‘q)
 * Localhost uchun
 */

require __DIR__ . '/../vendor/autoload.php';

/**
 * Laravel bootstrap
 */
$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\Http;

// =====================
// CONFIG
// =====================
$BOT_TOKEN = env('TELEGRAM_BOT_TOKEN');              // .env dan olinadi
$API_URL = 'http://127.0.0.1:8000/api';            // Laravel API

if (!$BOT_TOKEN) {
    die("❌ TELEGRAM_BOT_TOKEN topilmadi (.env)\n");
}

$offset = 0;

echo "🤖 Telegram polling ishga tushdi...\n";

// =====================
// POLLING LOOP
// =====================
while (true) {

    $response = file_get_contents(
        "https://api.telegram.org/bot{$BOT_TOKEN}/getUpdates?" .
        http_build_query([
            'timeout' => 10,
            'offset' => $offset,
        ])
    );

    $updates = json_decode($response, true);

    if (!empty($updates['result'])) {
        foreach ($updates['result'] as $update) {

            // keyingi update’lar uchun
            $offset = $update['update_id'] + 1;

            if (!isset($update['message'])) {
                continue;
            }

            $message = $update['message'];
            $chatId = $message['chat']['id'];
            $from = $message['from'];

            $telegramId = $from['id'];
            $username = $from['username'] ?? null;

            // =====================
            // /start
            // =====================
            // =====================
// /start
// =====================
            if (($message['text'] ?? null) === '/start') {

                $apiResponse = Http::post($API_URL . '/users/start', [
                    'telegram_id' => $telegramId,
                    'username' => $username,
                ]);

                $data = $apiResponse->json();

                // Agar telefon kerak bo‘lsa (yangi user)
                if (!empty($data['need_phone'])) {

                    sendMessage(
                        $BOT_TOKEN,
                        $chatId,
                        "👋 Assalomu alaykum!\nDavom etish uchun telefon raqamingizni yuboring 👇",
                        [
                            'keyboard' => [
                                [
                                    [
                                        'text' => '📱 Telefon raqamni yuborish',
                                        'request_contact' => true
                                    ]
                                ]
                            ],
                            'resize_keyboard' => true,
                            'one_time_keyboard' => true
                        ]
                    );

                } else {
                    // Oldin ro‘yxatdan o‘tgan user
                    sendMessage(
                        $BOT_TOKEN,
                        $chatId,
                        "✅ Siz avval ro‘yxatdan o‘tgansiz"
                    );
                }

                continue;
            }


            // =====================
            // CONTACT (phone)
            // =====================
            if (isset($message['contact'])) {

                if ($message['contact']['user_id'] != $telegramId) {
                    sendMessage(
                        $BOT_TOKEN,
                        $chatId,
                        "❗ Iltimos, o‘zingizning telefon raqamingizni yuboring"
                    );
                    continue;
                }

                Http::post($API_URL . '/users/phone', [
                    'telegram_id' => $telegramId,
                    'phone_number' => $message['contact']['phone_number'],
                ]);

                // 👇 BU YERDA keyboard olib tashlanadi
                sendMessage(
                    $BOT_TOKEN,
                    $chatId,
                    "✅ Ro‘yxatdan muvaffaqiyatli o‘tdingiz!",
                    null,
                    true // remove_keyboard = true
                );

                continue;
            }


            // =====================
            // MENU
            // =====================
            if (($message['text'] ?? null) === '📊 Balans') {
                sendMessage($BOT_TOKEN, $chatId, "💰 Balansingiz: test rejimida");
            }
        }
    }

    sleep(1); // CPU’ni asraymiz
}

// =====================
// FUNCTIONS
// =====================

function sendMessage($token, $chatId, $text, $keyboard = null, $removeKeyboard = false)
{
    $data = [
        'chat_id' => $chatId,
        'text' => $text,
    ];

    if ($removeKeyboard) {
        $data['reply_markup'] = json_encode([
            'remove_keyboard' => true
        ]);
    } elseif ($keyboard) {
        $data['reply_markup'] = json_encode($keyboard);
    }

    file_get_contents(
        "https://api.telegram.org/bot{$token}/sendMessage?" .
        http_build_query($data)
    );
}

