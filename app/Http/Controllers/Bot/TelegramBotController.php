<?php

namespace App\Http\Controllers\Bot;

use App\Http\Controllers\Controller;
use App\Services\WorkerNotificationService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;

class TelegramBotController extends Controller
{
    private string $token;
    private string $apiUrl;

    public function handle(Request $request): Response
    {
        $this->token  = config('services.telegram.bot_token', '');
        $this->apiUrl = rtrim(config('app.url'), '/') . '/api';

        if (!$this->token) {
            return response('', 200);
        }

        $update = $request->all();

        // Callback tugma bosildi (worker approve/reject)
        if (isset($update['callback_query'])) {
            $this->handleCallbackQuery($update['callback_query']);
            return response('', 200);
        }

        if (!isset($update['message'])) {
            return response('', 200);
        }

        $message = $update['message'];
        $chatId  = (int) ($message['chat']['id'] ?? 0);

        if ($chatId === 0) {
            return response('', 200);
        }

        // Karta bot guruhidan kelgan xabar — avto-toplam
        $cardBotChatId = (int) config('services.telegram.card_bot_chat_id', 0);
        $chatType      = $message['chat']['type'] ?? 'private';

        // Guruh chat ID ni aniqlash uchun vaqtinchalik log (CARD_BOT_CHAT_ID bo'sh bo'lsa)
        if ($cardBotChatId === 0 && in_array($chatType, ['group', 'supergroup'], true)) {
            Log::error('[SETUP] CARD_BOT_CHAT_ID=' . $chatId . ' | ' . ($message['chat']['title'] ?? ''));
        }

        if ($cardBotChatId !== 0 && $chatId === $cardBotChatId) {
            $this->handleCardGroupMessage($message);
            return response('', 200);
        }

        $from       = $message['from'];
        $telegramId = (int) ($from['id'] ?? 0);
        $username   = $from['username'] ?? null;

        if ($telegramId === 0) {
            return response('', 200);
        }

        $dbUser = DB::selectOne("SELECT * FROM users WHERE id = {$telegramId}");
        $role   = $dbUser?->role ?? 'guest';

        // Worker yoki Admin xabari
        if (in_array($role, ['worker', 'admin'], true)) {
            $this->handleWorkerMessage($chatId, $telegramId, $message);
            return response('', 200);
        }

        // Oddiy foydalanuvchi
        $this->handleUserMessage($chatId, $telegramId, $username, $message);

        return response('', 200);
    }

    // ══════════════════════════════════════════════════════════
    // WORKER
    // ══════════════════════════════════════════════════════════

    private function handleWorkerMessage(int $chatId, int $workerId, array $message): void
    {
        $text  = trim($message['text'] ?? '');
        $state = $this->getBotState($workerId);

        if ($state) {
            if ($text === '' || $text === '/start') {
                $this->clearBotState($workerId);
                $this->send($chatId, "✅ Amal bekor qilindi.");
                return;
            }
            $this->handleWorkerState($chatId, $workerId, $text, $state);
            return;
        }

        $webAppUrl = rtrim(config('app.url'), '/');
        $this->send($chatId,
            "👷 Worker bot faol.\n\nYangi buyurtma yoki chek kelganda siz bu yerda bildirishnoma olasiz.",
            ['inline_keyboard' => [[
                ['text' => '🛒 Ilovani ochish', 'web_app' => ['url' => $webAppUrl]],
            ]]]
        );
    }

    private function handleWorkerState(int $chatId, int $workerId, string $reason, object $state): void
    {
        $reason  = mb_substr(trim($reason), 0, 500);
        $payload = is_string($state->payload)
            ? json_decode($state->payload, true)
            : (array) $state->payload;

        if ($state->state === 'cancel_reason') {
            $type    = $payload['type'] ?? '';
            $orderId = (int) ($payload['id'] ?? 0);
            $this->clearBotState($workerId);
            if ($orderId > 0 && $this->orderTable($type)) {
                $this->doCancelOrder($chatId, $type, $orderId, $reason);
            }
            return;
        }

        if ($state->state === 'reject_reason') {
            $topupId = (int) ($payload['id'] ?? 0);
            $this->clearBotState($workerId);
            if ($topupId > 0) {
                $this->doRejectTopup($chatId, $topupId, $reason, $workerId);
            }
            return;
        }

        $this->clearBotState($workerId);
    }

    // ══════════════════════════════════════════════════════════
    // USER
    // ══════════════════════════════════════════════════════════

    private function handleUserMessage(int $chatId, int $telegramId, ?string $username, array $message): void
    {
        $webAppUrl = rtrim(config('app.url'), '/');

        if (($message['text'] ?? null) === '/start') {
            if (!$username) {
                $this->send($chatId,
                    "❗ Ilovadan foydalanish uchun Telegram username o'rnatishingiz kerak.\n\n" .
                    "Sozlamalar → Profilni tahrirlash → Username qo'shing, keyin /start bosing."
                );
                return;
            }

            // Literal ID in SQL to avoid PDO 32-bit truncation for large Telegram IDs
            $tid = (int) $telegramId;
            DB::statement("INSERT IGNORE INTO users (id, username, role, created_at) VALUES ({$tid}, ?, 'user', NOW())", [$username]);
            DB::statement("INSERT IGNORE INTO user_balances (user_id, balance, updated_at) VALUES ({$tid}, 0, NOW())");

            $user = DB::selectOne("SELECT * FROM users WHERE id = {$tid}");

            if ($user && $username && $user->username !== $username) {
                DB::statement("UPDATE users SET username = ? WHERE id = {$tid}", [$username]);
            }

            $needPhone = empty($user->phone_number ?? null);

            if ($needPhone) {
                $this->send($chatId,
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
                $balance = (float) DB::selectOne("SELECT balance FROM user_balances WHERE user_id = {$tid}")?->balance ?? 0;
                $this->send($chatId,
                    "Xush kelibsiz! 👋\nBalansingiz: " . number_format($balance, 0, '.', ' ') . " so'm",
                    ['inline_keyboard' => [[
                        ['text' => '🛒 Ilovani ochish', 'web_app' => ['url' => $webAppUrl]],
                    ]]]
                );
            }
            return;
        }

        if (isset($message['contact'])) {
            if ($message['contact']['user_id'] != $telegramId) {
                $this->send($chatId, "Iltimos, o'zingizning telefon raqamingizni yuboring.");
                return;
            }
            $tid         = (int) $telegramId;
            $phoneNumber = $message['contact']['phone_number'];
            $phoneExists = DB::selectOne(
                "SELECT id FROM users WHERE phone_number = ? AND id != {$tid} LIMIT 1",
                [$phoneNumber]
            );
            if (!$phoneExists) {
                DB::statement("UPDATE users SET phone_number = ? WHERE id = {$tid} AND phone_number IS NULL", [$phoneNumber]);
            }
            $this->send($chatId, "Ro'yxatdan muvaffaqiyatli o'tdingiz! ✅", ['remove_keyboard' => true]);
            $this->send($chatId,
                "Ilovani ochish uchun quyidagi tugmani bosing:",
                ['inline_keyboard' => [[
                    ['text' => '🛒 Ilovani ochish', 'web_app' => ['url' => $webAppUrl]],
                ]]]
            );
            return;
        }

        if (($message['text'] ?? null) === 'Balans') {
            $balance = (float) (DB::table('user_balances')
                ->where('user_id', $telegramId)->value('balance') ?? 0);
            $this->send($chatId,
                "💰 Balansingiz: " . number_format($balance, 0, '.', ' ') . " so'm",
                ['inline_keyboard' => [[
                    ['text' => '🛒 Ilovani ochish', 'web_app' => ['url' => $webAppUrl]],
                ]]]
            );
            return;
        }

        // AI yordamchi
        $userText = trim($message['text'] ?? '');
        if ($userText !== '') {
            try {
                $aiService = app(\App\Services\OpenAiService::class);
                $reply = $aiService->botAnswer($userText);
                if ($reply !== '') {
                    $this->send($chatId, $reply);
                }
            } catch (\Throwable $e) {
                Log::warning('Bot AI xato: ' . $e->getMessage());
            }
        }
    }

    // ══════════════════════════════════════════════════════════
    // CALLBACK QUERY
    // ══════════════════════════════════════════════════════════

    private function handleCallbackQuery(array $cb): void
    {
        $callbackId = $cb['id'] ?? '';
        $chatId     = (int) ($cb['message']['chat']['id'] ?? 0);
        $workerId   = (int) ($cb['from']['id'] ?? 0);
        $data       = $cb['data'] ?? '';

        if ($workerId === 0) {
            return;
        }

        $dbUser = DB::selectOne("SELECT * FROM users WHERE id = {$workerId}");
        $role   = $dbUser?->role ?? 'guest';

        if (!in_array($role, ['worker', 'admin'], true)) {
            $this->answerCallback($callbackId, "❌ Ruxsat yo'q.");
            return;
        }

        $this->answerCallback($callbackId);

        // o:{type}:{action}:{id}
        if (str_starts_with($data, 'o:')) {
            $parts = explode(':', $data, 4);
            if (count($parts) !== 4) return;
            [, $type, $action, $id] = $parts;
            $orderId = (int) $id;
            if ($orderId <= 0 || !in_array($action, ['a', 'c'], true) || !$this->orderTable($type)) return;

            if ($action === 'a') {
                $this->doApproveOrder($chatId, $type, $orderId);
            } else {
                $this->setBotState($workerId, 'cancel_reason', ['type' => $type, 'id' => $orderId]);
                $this->send($chatId,
                    "❌ Buyurtma #{$orderId} uchun bekor qilish *sababini* yozing:\n_(Bekor qilish uchun /start yuboring)_"
                );
            }
            return;
        }

        // t:{action}:{id}
        if (str_starts_with($data, 't:')) {
            $parts = explode(':', $data, 3);
            if (count($parts) !== 3) return;
            [, $action, $id] = $parts;
            $topupId = (int) $id;
            if ($topupId <= 0 || !in_array($action, ['a', 'r'], true)) return;

            if ($action === 'a') {
                $this->doApproveTopup($chatId, $topupId, (int) $workerId);
            } else {
                $this->setBotState($workerId, 'reject_reason', ['id' => $topupId]);
                $this->send($chatId,
                    "❌ Chek #{$topupId} uchun rad etish *sababini* yozing:\n_(Bekor qilish uchun /start yuboring)_"
                );
            }
            return;
        }
    }

    // ══════════════════════════════════════════════════════════
    // ORDER ACTIONS
    // ══════════════════════════════════════════════════════════

    private function doApproveOrder(int $chatId, string $type, int $orderId): void
    {
        $table = $this->orderTable($type);
        if (!$table) { $this->send($chatId, "❌ Noto'g'ri tur."); return; }

        $order = DB::table($table)->where('id', $orderId)->first();
        if (!$order || !in_array($order->status, ['paid', 'pending'], true)) {
            $this->send($chatId, "⚠️ Buyurtma #{$orderId} topilmadi yoki allaqachon qayta ishlangan.");
            return;
        }

        DB::table($table)->where('id', $orderId)->update(['status' => 'delivered']);

        $this->createOrderNotification(
            userId:    (int) $order->user_id,
            orderType: $this->orderTypeLabel($type),
            orderId:   $orderId,
            status:    'delivered',
            title:     $this->orderDeliveredTitle($type),
            message:   $this->orderDeliveredMessage($type)
        );

        $this->send($chatId, "✅ Buyurtma #{$orderId} tasdiqlandi.");
    }

    private function doCancelOrder(int $chatId, string $type, int $orderId, string $reason): void
    {
        $table = $this->orderTable($type);
        if (!$table) { $this->send($chatId, "❌ Noto'g'ri tur."); return; }

        $order = DB::table($table)->where('id', $orderId)->first();
        if (!$order || !in_array($order->status, ['paid', 'pending'], true)) {
            $this->send($chatId, "⚠️ Buyurtma #{$orderId} topilmadi yoki allaqachon qayta ishlangan.");
            return;
        }

        DB::transaction(function () use ($table, $order, $orderId) {
            DB::table($table)->where('id', $orderId)->update(['status' => 'canceled']);
            $refund = (float) ($order->sell_price ?? 0);
            if ($refund > 0) {
                $row = DB::table('user_balances')->where('user_id', $order->user_id)->lockForUpdate()->first();
                DB::table('user_balances')->where('user_id', $order->user_id)
                    ->update(['balance' => (float) ($row->balance ?? 0) + $refund, 'updated_at' => now()]);
            }
        });

        $this->createOrderNotification(
            userId:      (int) $order->user_id,
            orderType:   $this->orderTypeLabel($type),
            orderId:     $orderId,
            status:      'canceled',
            title:       '❌ Buyurtma bekor qilindi',
            message:     "Buyurtmangiz bekor qilindi.",
            description: $reason
        );

        $this->send($chatId, "✅ Buyurtma #{$orderId} bekor qilindi.");
    }

    // ══════════════════════════════════════════════════════════
    // TOPUP ACTIONS
    // ══════════════════════════════════════════════════════════

    private function doApproveTopup(int $chatId, int $topupId, int $workerId = 0): void
    {
        $topup = DB::table('manual_topup_requests')->where('id', $topupId)->first();
        if (!$topup || $topup->status !== 'pending') {
            $this->send($chatId, "⚠️ Chek #{$topupId} topilmadi yoki allaqachon qayta ishlangan.");
            return;
        }

        $amount = (float) $topup->amount;

        DB::transaction(function () use ($topupId, $topup, $amount) {
            DB::table('manual_topup_requests')->where('id', $topupId)->update(['status' => 'approved']);
            $row = DB::table('user_balances')->where('user_id', $topup->user_id)->lockForUpdate()->first();
            DB::table('user_balances')->where('user_id', $topup->user_id)
                ->update(['balance' => (float) ($row->balance ?? 0) + $amount, 'updated_at' => now()]);
        });

        $this->createTopupNotification(
            userId:  (int) $topup->user_id,
            topupId: $topupId,
            status:  'approved',
            title:   "✅ Balans to'ldirildi",
            message: number_format($amount, 0, '.', ' ') . " so'm balansingizga qo'shildi."
        );

        $worker = $workerId ? DB::selectOne("SELECT username FROM users WHERE id = {$workerId}") : null;
        $workerName = $worker?->username ? "@{$worker->username}" : ($workerId ? "Worker #{$workerId}" : 'Worker');

        WorkerNotificationService::editTopupMessages(
            $topupId,
            "✅ Chek #{$topupId} tasdiqlandi.\n💰 " . number_format($amount, 0, '.', ' ') . " so'm\n👤 {$workerName} tomonidan"
        );

        $this->send($chatId,
            "✅ Chek #{$topupId} qabul qilindi. " . number_format($amount, 0, '.', ' ') . " so'm qo'shildi."
        );
    }

    private function doRejectTopup(int $chatId, int $topupId, string $reason, int $workerId = 0): void
    {
        try {
            $topup = DB::transaction(function () use ($topupId, $reason) {
                $topup = DB::table('manual_topup_requests')
                    ->where('id', $topupId)->where('status', 'pending')
                    ->lockForUpdate()->first();
                if (!$topup) throw new \RuntimeException('already_processed');
                DB::table('manual_topup_requests')->where('id', $topupId)
                    ->update(['status' => 'rejected', 'notes' => $reason]);
                return $topup;
            });
        } catch (\RuntimeException $e) {
            $this->send($chatId, "⚠️ Chek #{$topupId} topilmadi yoki allaqachon qayta ishlangan.");
            return;
        }

        $this->createTopupNotification(
            userId:      (int) $topup->user_id,
            topupId:     $topupId,
            status:      'rejected',
            title:       '❌ Chek rad etildi',
            message:     "Chekingiz rad etildi.",
            description: $reason
        );

        $worker = $workerId ? DB::selectOne("SELECT username FROM users WHERE id = {$workerId}") : null;
        $workerName = $worker?->username ? "@{$worker->username}" : ($workerId ? "Worker #{$workerId}" : 'Worker');

        WorkerNotificationService::editTopupMessages(
            $topupId,
            "❌ Chek #{$topupId} rad etildi.\n👤 {$workerName} tomonidan\n📝 Sabab: {$reason}"
        );

        $this->send($chatId, "✅ Chek #{$topupId} rad etildi.");
    }

    // ══════════════════════════════════════════════════════════
    // NOTIFICATIONS
    // ══════════════════════════════════════════════════════════

    private function createOrderNotification(
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

    private function createTopupNotification(
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

    // ══════════════════════════════════════════════════════════
    // BOT STATE
    // ══════════════════════════════════════════════════════════

    private function getBotState(int $userId): ?object
    {
        if (!Schema::hasTable('bot_states')) return null;
        return DB::table('bot_states')->where('user_id', $userId)->first();
    }

    private function setBotState(int $userId, string $state, array $payload): void
    {
        if (!Schema::hasTable('bot_states')) return;
        DB::table('bot_states')->updateOrInsert(
            ['user_id' => $userId],
            ['state' => $state, 'payload' => json_encode($payload)]
        );
    }

    private function clearBotState(int $userId): void
    {
        if (!Schema::hasTable('bot_states')) return;
        DB::table('bot_states')->where('user_id', $userId)->delete();
    }

    // ══════════════════════════════════════════════════════════
    // CARD BOT AUTO-TOPUP
    // ══════════════════════════════════════════════════════════

    private function handleCardGroupMessage(array $message): void
    {
        $text = trim($message['text'] ?? $message['caption'] ?? '');
        if ($text === '') {
            return;
        }

        // Karta bot username larini tekshirish
        $senderUsername = strtolower($message['from']['username'] ?? '');
        $watchedBots    = array_map(
            fn ($b) => strtolower(trim($b)),
            explode(',', config('services.telegram.card_bot_usernames', 'CardXabarBot,HUMOcardbot'))
        );

        $isFromCardBot = in_array($senderUsername, $watchedBots, true);

        // Forward qilingan xabar bo'lsa ham tekshirish
        if (! $isFromCardBot) {
            $fwdUsername = strtolower($message['forward_from']['username'] ?? '');
            $isFromCardBot = $fwdUsername !== '' && in_array($fwdUsername, $watchedBots, true);
        }

        if (! $isFromCardBot) {
            return;
        }

        $amount = $this->parseCardPaymentAmount($text);
        if ($amount === null || $amount <= 0) {
            Log::info('CardBot: summa topilmadi', ['text' => mb_substr($text, 0, 200)]);
            return;
        }

        Log::info("CardBot: {$amount} so'm to'lov aniqlandi");
        $this->autoApproveTopupByAmount($amount);
    }

    private function parseCardPaymentAmount(string $text): ?int
    {
        $patterns = [
            // HUMOcardbot: "To'ldirish\n⬆️ 1.000,00 UZS" — to.ldirish (. = har qanday belgi)
            '/to.ldirish[^\d]*([\d]{1,3}(?:[.\s]\d{3})*(?:,\d+)?)\s*UZS/iu',
            // Yevropa formati: "1.000,00 UZS" (nuqta=minglik)
            '/([\d]{1,3}(?:\.\d{3})+(?:,\d+)?)\s*UZS/u',
            // Kirim/kredit kalit so'zi
            '/(?:kirim|kredit|tushdi keldi|o\'tkazildi)[:\s]*\+?\s*([\d][.\d\s]*)\s*(?:UZS|so\'?m|sum)?/iu',
            // "150 000 UZS tushdi"
            '/([\d][\d\s]+)\s*(?:UZS|so\'?m|sum)\s+tushdi/iu',
            // "+150 000 UZS"
            '/\+\s*([\d][.\d\s]*)\s*(?:UZS|so\'?m|sum)/iu',
            // "Summa: +150 000"
            '/(?:summa|mablag\')[:\s]*\+\s*([\d][.\d\s]*)/iu',
        ];

        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $text, $matches)) {
                $amount = $this->normalizeAmount($matches[1]);
                if ($amount >= 1000) {
                    return $amount;
                }
            }
        }

        return null;
    }

    private function normalizeAmount(string $raw): int
    {
        $raw = trim($raw);

        // Yevropa formati: "1.000,00" yoki "1.000.000,50"
        // Nuqta minglik ajratuvchi, vergul kasr belgisi
        if (preg_match('/^\d{1,3}(\.\d{3})+/', $raw)) {
            // Verguldan keyingi kasr qismini olib tashlash
            if (str_contains($raw, ',')) {
                $raw = explode(',', $raw)[0];
            }
            $raw = str_replace('.', '', $raw);
        }

        // Oddiy format: bo'shliq va nuqtalarni olib tashlash
        $raw = preg_replace('/[\s.,]+/', '', $raw);

        return (int) $raw;
    }

    private function autoApproveTopupByAmount(int $amount): void
    {
        $approved = null;

        DB::transaction(function () use ($amount, &$approved) {
            // SELECT va UPDATE bitta transaksiyada — ikki webhook bir vaqtda kelsa ham xavfsiz.
            // lockForUpdate() → ikkinchi so'rov birinchisi tugaguncha kutadi.
            $topup = DB::table('manual_topup_requests')
                ->where('status', 'pending')
                ->whereRaw('ROUND(amount) = ?', [$amount])
                ->orderBy('id')
                ->lockForUpdate()
                ->first();

            if (! $topup) {
                return;
            }

            // status='pending' sharti bilan yangilash — parallel jarayon allaqachon tasdiqlagan bo'lsa 0 qaytaradi
            $updated = DB::table('manual_topup_requests')
                ->where('id', $topup->id)
                ->where('status', 'pending')
                ->update(['status' => 'approved', 'notes' => 'Avto-tasdiqlandi (karta bot)']);

            if ($updated === 0) {
                return;
            }

            $row = DB::table('user_balances')
                ->where('user_id', $topup->user_id)
                ->lockForUpdate()
                ->first();

            DB::table('user_balances')
                ->where('user_id', $topup->user_id)
                ->update([
                    'balance'    => (float) ($row->balance ?? 0) + $amount,
                    'updated_at' => now(),
                ]);

            $approved = $topup;
        });

        if (! $approved) {
            Log::info("CardBot: {$amount} so'mga mos kutayotgan so'rov topilmadi yoki allaqachon tasdiqlangan");
            return;
        }

        $this->createTopupNotification(
            userId:  (int) $approved->user_id,
            topupId: (int) $approved->id,
            status:  'approved',
            title:   "✅ Balans to'ldirildi",
            message: number_format($amount, 0, '.', ' ') . " so'm balansingizga qo'shildi."
        );

        WorkerNotificationService::editTopupMessages(
            (int) $approved->id,
            "✅ So'rov #{$approved->id} avto-tasdiqlandi.\n💰 " . number_format($amount, 0, '.', ' ') . " so'm\n🤖 Karta bot orqali"
        );

        Log::info("CardBot: so'rov #{$approved->id} avto-tasdiqlandi, {$amount} so'm, user {$approved->user_id}");
    }

    // ══════════════════════════════════════════════════════════
    // HELPERS
    // ══════════════════════════════════════════════════════════

    private function orderTable(string $type): ?string
    {
        return match ($type) {
            'uc'  => 'uc_orders',
            'ml'  => 'ml_orders',
            'srv' => 'service_orders',
            default => null,
        };
    }

    private function orderTypeLabel(string $type): string
    {
        return match ($type) {
            'uc'  => 'uc',
            'ml'  => 'ml',
            'srv' => 'service',
            default => $type,
        };
    }

    private function orderDeliveredTitle(string $type): string
    {
        return match ($type) {
            'uc'  => 'UC tushdi ✅',
            'ml'  => 'Almaz tushdi ✅',
            'srv' => 'Xizmat bajarildi ✅',
            default => 'Buyurtma bajarildi ✅',
        };
    }

    private function orderDeliveredMessage(string $type): string
    {
        return match ($type) {
            'uc'  => 'Buyurtmangiz bajarildi. UC hisobingizga tushirildi.',
            'ml'  => 'Buyurtmangiz bajarildi. Almaz hisobingizga tushirildi.',
            'srv' => 'Buyurtmangiz bajarildi.',
            default => 'Buyurtmangiz bajarildi.',
        };
    }

    // ══════════════════════════════════════════════════════════
    // TELEGRAM API
    // ══════════════════════════════════════════════════════════

    private function send(int $chatId, string $text, ?array $replyMarkup = null): void
    {
        $data = [
            'chat_id' => $chatId,
            'text'    => $text,
        ];
        if ($replyMarkup !== null) {
            $data['reply_markup'] = json_encode($replyMarkup);
        }
        try {
            Http::timeout(10)->post("https://api.telegram.org/bot{$this->token}/sendMessage", $data);
        } catch (\Throwable $e) {
            Log::warning('TelegramBot sendMessage xato: ' . $e->getMessage());
        }
    }

    private function answerCallback(string $callbackId, string $text = ''): void
    {
        $data = ['callback_query_id' => $callbackId];
        if ($text !== '') $data['text'] = $text;
        try {
            Http::timeout(5)->post("https://api.telegram.org/bot{$this->token}/answerCallbackQuery", $data);
        } catch (\Throwable $e) {
            // ignore
        }
    }
}
