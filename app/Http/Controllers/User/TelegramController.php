<?php

namespace App\Http\Controllers\User;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class TelegramController extends Controller
{
    public function handle(Request $request)
    {
        $update = $request->all();

        if (!isset($update['message'])) {
            return response()->json(['ok' => true]);
        }

        $message = $update['message'];
        $chatId = $message['chat']['id'];
        $from = $message['from'];

        $telegramId = $from['id'];
        $username = $from['username'] ?? null;

        // /start
        if (($message['text'] ?? null) === '/start') {

            $apiResponse = Http::post(url('/api/users/start'), [
                'telegram_id' => $telegramId,
                'username' => $username,
            ]);

            $data = $apiResponse->json();

            if (!empty($data['need_phone'])) {

                $this->sendMessage(
                    $chatId,
                    "👋 Assalomu alaykum!\nTelefon raqamingizni yuboring 👇",
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
                $this->sendMessage($chatId, "✅ Siz avval ro‘yxatdan o‘tgansiz");
            }
        }

        // CONTACT
        if (isset($message['contact'])) {

            if ($message['contact']['user_id'] != $telegramId) {

                $this->sendMessage(
                    $chatId,
                    "❗ Iltimos o‘zingizning telefon raqamingizni yuboring"
                );

                return response()->json(['ok' => true]);
            }

            Http::post(url('/api/users/phone'), [
                'telegram_id' => $telegramId,
                'phone_number' => $message['contact']['phone_number'],
            ]);

            $this->sendMessage(
                $chatId,
                "✅ Ro‘yxatdan muvaffaqiyatli o‘tdingiz!",
                null,
                true
            );
        }

        return response()->json(['ok' => true]);
    }

    private function sendMessage($chatId, $text, $keyboard = null, $removeKeyboard = false)
    {
        $token = env('TELEGRAM_BOT_TOKEN');

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

        Http::post("https://api.telegram.org/bot{$token}/sendMessage", $data);
    }
}