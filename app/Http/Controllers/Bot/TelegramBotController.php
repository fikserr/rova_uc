<?php

namespace App\Http\Controllers\Bot;

use App\Http\Controllers\Controller;
use App\Services\BotTranslator;
use App\Services\ReceiptService;
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

        $webhookSecret = config('services.telegram.webhook_secret', '');
        if ($webhookSecret && $request->header('X-Telegram-Bot-Api-Secret-Token') !== $webhookSecret) {
            return response('', 401);
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

        $from       = $message['from'];
        $telegramId = (int) ($from['id'] ?? 0);
        $username   = $from['username'] ?? null;

        if ($telegramId === 0) {
            return response('', 200);
        }

        $dbUser = DB::selectOne("SELECT * FROM users WHERE id = {$telegramId}");
        $role   = $dbUser?->role ?? 'guest';

        if (in_array($role, ['worker', 'admin'], true)) {
            $this->handleWorkerMessage($chatId, $telegramId, $message);
            return response('', 200);
        }

        if ($role === 'reseller') {
            $this->handleResellerMessage($chatId, $telegramId, $message);
            return response('', 200);
        }

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
        $t     = new BotTranslator('uz');

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
            $t->get('worker_greeting'),
            ['inline_keyboard' => [[
                ['text' => $t->get('open_app'), 'web_app' => ['url' => $webAppUrl]],
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
        $tid       = (int) $telegramId;

        $dbUser  = DB::selectOne("SELECT language FROM users WHERE id = {$tid}");
        $lang    = $dbUser?->language ?? 'uz';
        $t       = new BotTranslator($lang);

        $msgText = $message['text'] ?? '';
        if ($msgText === '/start' || str_starts_with($msgText, '/start ')) {
            if (!$username) {
                $this->send($chatId, $t->get('need_username'));
                return;
            }

            // Extract referrer ID from "/start ref_12345"
            $referrerId = 0;
            if (str_starts_with($msgText, '/start ref_')) {
                $refPart    = substr($msgText, strlen('/start ref_'));
                $referrerId = (int) $refPart;
                if ($referrerId === $tid) $referrerId = 0;
            }

            try {
                $existsBefore = DB::selectOne("SELECT id FROM users WHERE id = {$tid}");

                DB::statement("INSERT IGNORE INTO users (id, username, role, language, created_at) VALUES ({$tid}, ?, 'user', ?, NOW())", [$username, $lang]);
                DB::statement("INSERT IGNORE INTO user_balances (user_id, balance, updated_at) VALUES ({$tid}, 0, NOW())");

                $user = DB::selectOne("SELECT * FROM users WHERE id = {$tid}");

                if ($user && $username && $user->username !== $username) {
                    DB::statement("UPDATE users SET username = ? WHERE id = {$tid}", [$username]);
                }

                // Save referral if this is a new user (isolated try-catch so referral error never blocks the response)
                if (!$existsBefore && $referrerId > 0) {
                    try {
                        $referrerExists = DB::selectOne("SELECT id FROM users WHERE id = {$referrerId}");
                        if ($referrerExists) {
                            DB::table('referrals')->updateOrInsert(
                                ['referred_user_id' => $tid],
                                [
                                    'referrer_id'     => $referrerId,
                                    'reward_amount'   => 0,
                                    'reward_currency' => 'UZS',
                                    'rewarded_at'     => null,
                                    'created_at'      => now(),
                                ]
                            );
                        }
                    } catch (\Throwable $re) {
                        Log::warning('Bot: referral save failed', [
                            'tid'        => $tid,
                            'referrerId' => $referrerId,
                            'error'      => $re->getMessage(),
                        ]);
                    }
                }

                $needPhone = empty($user?->phone_number ?? null);

                if ($needPhone) {
                    $this->send($chatId, $t->get('need_phone'), [
                        'keyboard'          => [[['text' => $t->get('phone_button'), 'request_contact' => true]]],
                        'resize_keyboard'   => true,
                        'one_time_keyboard' => true,
                    ]);
                } else {
                    $balance = (float) (DB::selectOne("SELECT balance FROM user_balances WHERE user_id = {$tid}")?->balance ?? 0);
                    $this->send($chatId,
                        $t->get('welcome_back', number_format($balance, 0, '.', ' ')),
                        ['inline_keyboard' => [[['text' => $t->get('open_app'), 'web_app' => ['url' => $webAppUrl]]]]]
                    );
                }
            } catch (\Throwable $e) {
                Log::error('Bot: /start handler crashed', ['tid' => $tid, 'error' => $e->getMessage()]);
                $this->send($chatId, $t->get('need_phone'), [
                    'keyboard'          => [[['text' => $t->get('phone_button'), 'request_contact' => true]]],
                    'resize_keyboard'   => true,
                    'one_time_keyboard' => true,
                ]);
            }
            return;
        }

        if (isset($message['contact'])) {
            if ($message['contact']['user_id'] != $telegramId) {
                $this->send($chatId, $t->get('wrong_contact'));
                return;
            }
            $phoneNumber = $message['contact']['phone_number'];
            $phoneExists = DB::selectOne(
                "SELECT id FROM users WHERE phone_number = ? AND id != {$tid} LIMIT 1",
                [$phoneNumber]
            );
            if (!$phoneExists) {
                DB::statement("UPDATE users SET phone_number = ? WHERE id = {$tid} AND phone_number IS NULL", [$phoneNumber]);
                // Trigger referral reward on first phone registration (same logic as web API)
                $this->triggerReferralReward($tid);
            }
            $this->send($chatId,
                $t->get('registered'),
                ['inline_keyboard' => [[['text' => $t->get('open_app'), 'web_app' => ['url' => $webAppUrl]]]]]
            );
            return;
        }

        if (($message['text'] ?? null) === 'Balans') {
            $balance = (float) (DB::table('user_balances')->where('user_id', $telegramId)->value('balance') ?? 0);
            $this->send($chatId,
                $t->get('balance', number_format($balance, 0, '.', ' ')),
                ['inline_keyboard' => [[['text' => $t->get('open_app'), 'web_app' => ['url' => $webAppUrl]]]]]
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

        if ($role === 'reseller' && str_starts_with($data, 'rs:')) {
            $this->answerCallback($callbackId);
            $this->handleResellerCallback($chatId, $workerId, $data);
            return;
        }

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

        // Chek yozish va Telegram orqali mijozga yuborish
        $receiptType = match ($type) {
            'uc'  => 'uc',
            'ml'  => 'ml',
            'srv' => 'srv',
            'bnd' => 'bundle',
            default => $type,
        };
        app(ReceiptService::class)->record($receiptType, $orderId);

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
    // REFERRAL
    // ══════════════════════════════════════════════════════════

    private function triggerReferralReward(int $userId): void
    {
        try {
            DB::transaction(function () use ($userId) {
                $referral = DB::table('referrals')
                    ->where('referred_user_id', $userId)
                    ->whereNull('rewarded_at')
                    ->lockForUpdate()
                    ->first();

                if (!$referral) return;

                $setting = DB::table('referral_settings')
                    ->orderByDesc('id')
                    ->first();

                if (!$setting || !$setting->is_active || (float) $setting->reward_amount <= 0) return;

                $rewardAmount = (float) $setting->reward_amount;
                $referrerId   = (int) $referral->referrer_id;

                $balanceRow = DB::table('user_balances')
                    ->where('user_id', $referrerId)
                    ->lockForUpdate()
                    ->first();

                $newBalance = (float) ($balanceRow?->balance ?? 0) + $rewardAmount;

                if ($balanceRow) {
                    DB::table('user_balances')
                        ->where('user_id', $referrerId)
                        ->update(['balance' => $newBalance, 'updated_at' => now()]);
                } else {
                    DB::table('user_balances')->insert([
                        'user_id'    => $referrerId,
                        'balance'    => $newBalance,
                        'updated_at' => now(),
                    ]);
                }

                DB::table('referrals')
                    ->where('id', $referral->id)
                    ->update([
                        'reward_amount'   => $rewardAmount,
                        'reward_currency' => 'UZS',
                        'rewarded_at'     => now(),
                    ]);

                DB::table('payments')->insert([
                    'user_id'        => $referrerId,
                    'click_trans_id' => 'REFERRAL-' . $referral->id . '-' . now()->timestamp . '-' . random_int(1000, 9999),
                    'amount'         => $rewardAmount,
                    'currency'       => 'UZS',
                    'provider'       => 'referral',
                    'status'         => 'paid',
                    'created_at'     => now(),
                    'updated_at'     => now(),
                ]);
            });
        } catch (\Throwable $e) {
            Log::warning('Bot: referral reward failed', ['userId' => $userId, 'error' => $e->getMessage()]);
        }
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
            'bnd' => 'bundle_orders',
            default => null,
        };
    }

    private function orderTypeLabel(string $type): string
    {
        return match ($type) {
            'uc'  => 'uc',
            'ml'  => 'ml',
            'srv' => 'service',
            'bnd' => 'uc',
            default => $type,
        };
    }

    private function orderDeliveredTitle(string $type): string
    {
        return match ($type) {
            'uc'  => 'UC tushdi ✅',
            'ml'  => 'Almaz tushdi ✅',
            'srv' => 'Xizmat bajarildi ✅',
            'bnd' => "To'plam tushdi ✅",
            default => 'Buyurtma bajarildi ✅',
        };
    }

    private function orderDeliveredMessage(string $type): string
    {
        return match ($type) {
            'uc'  => 'Buyurtmangiz bajarildi. UC hisobingizga tushirildi.',
            'ml'  => 'Buyurtmangiz bajarildi. Almaz hisobingizga tushirildi.',
            'srv' => 'Buyurtmangiz bajarildi.',
            'bnd' => "Buyurtmangiz bajarildi. To'plam hisobingizga tushirildi.",
            default => 'Buyurtmangiz bajarildi.',
        };
    }

    // ══════════════════════════════════════════════════════════
    // TELEGRAM API
    // ══════════════════════════════════════════════════════════

    private function send(int $chatId, string $text, ?array $replyMarkup = null): void
    {
        $data = [
            'chat_id'    => $chatId,
            'text'       => $text,
            'parse_mode' => 'HTML',
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

    // ══════════════════════════════════════════════════════════
    // RESELLER
    // ══════════════════════════════════════════════════════════

    private function resellerLang(int $userId): BotTranslator
    {
        $lang = DB::table('users')->where('id', $userId)->value('language') ?? 'uz';
        return new BotTranslator((string) $lang);
    }

    private function handleResellerMessage(int $chatId, int $userId, array $message): void
    {
        $text  = trim($message['text'] ?? '');
        $state = $this->getBotState($userId);
        $t     = $this->resellerLang($userId);

        if ($state && !str_starts_with($text, '/')) {
            $this->handleResellerState($chatId, $userId, $text, $state);
            return;
        }

        if ($state) $this->clearBotState($userId);

        if ($text === '/start' || $text === '') {
            $this->sendResellerMenu($chatId, $userId);
            return;
        }

        if ($text === '/balance') {
            $balance = (float) (DB::table('user_balances')->where('user_id', $userId)->value('balance') ?? 0);
            $this->send($chatId, $t->get('balance', number_format($balance, 0, '.', ' ')));
            return;
        }

        if ($text === '/orders') {
            $this->sendResellerOrders($chatId, $userId);
            return;
        }

        $this->sendResellerMenu($chatId, $userId);
    }

    private function handleResellerState(int $chatId, int $userId, string $text, object $state): void
    {
        $payload = is_string($state->payload) ? json_decode($state->payload, true) : (array) $state->payload;

        // Waiting for player ID
        if ($state->state === 'rs_player_id') {
            $productId = (int) ($payload['product_id'] ?? 0);
            $product   = DB::table('sekali_products')->where('id', $productId)->first();
            if (!$product) { $this->clearBotState($userId); return; }

            $needsZone = str_contains(strtolower($product->required_fields ?? ''), 'zone');

            if ($needsZone) {
                $this->setBotState($userId, 'rs_zone_id', array_merge($payload, ['player_id' => $text]));
                $this->send($chatId, "🌐 <b>Server ID</b> kiriting:\n<i>Masalan: 1234</i>");
                return;
            }

            $this->placeResellerOrder($chatId, $userId, $productId, $text, null);
            return;
        }

        // Waiting for zone ID
        if ($state->state === 'rs_zone_id') {
            $productId = (int) ($payload['product_id'] ?? 0);
            $playerId  = $payload['player_id'] ?? '';
            $this->placeResellerOrder($chatId, $userId, $productId, $playerId, $text);
            return;
        }

        $this->clearBotState($userId);
    }

    private function handleResellerCallback(int $chatId, int $userId, string $data): void
    {
        $t = $this->resellerLang($userId);

        if ($data === 'rs:menu') {
            $this->sendResellerMenu($chatId, $userId);
            return;
        }

        if ($data === 'rs:games') {
            $games = DB::table('sekali_products')
                ->where('is_active', true)
                ->whereNotNull('reseller_price_uzs')
                ->select('game_name')->distinct()->orderBy('game_name')->pluck('game_name');

            if ($games->isEmpty()) {
                $this->send($chatId, $t->get('rs_no_products'));
                return;
            }

            $buttons   = $games->map(fn($g) => [['text' => "🎮 {$g}", 'callback_data' => "rs:game:{$g}"]])->values()->all();
            $buttons[] = [['text' => $t->get('rs_back_menu'), 'callback_data' => 'rs:menu']];
            $this->send($chatId, $t->get('rs_select_game'), ['inline_keyboard' => $buttons]);
            return;
        }

        if (str_starts_with($data, 'rs:game:')) {
            $game     = substr($data, 8);
            $products = DB::table('sekali_products')
                ->where('is_active', true)
                ->where('game_name', $game)
                ->whereNotNull('reseller_price_uzs')
                ->orderBy('reseller_price_uzs')
                ->get(['id', 'name', 'reseller_price_uzs', 'price_uzs']);

            if ($products->isEmpty()) {
                $this->send($chatId, $t->get('rs_game_no_items'));
                return;
            }

            $buttons = $products->map(fn($p) => [[
                'text'          => $p->name . ' — ' . number_format($p->reseller_price_uzs, 0, '.', ' ') . ' UZS',
                'callback_data' => 'rs:buy:' . $p->id,
            ]])->values()->all();
            $buttons[] = [['text' => $t->get('rs_back_games'), 'callback_data' => 'rs:games']];

            $this->send($chatId, $t->get('rs_game_products', $game), ['inline_keyboard' => $buttons]);
            return;
        }

        if (str_starts_with($data, 'rs:buy:')) {
            $productId = (int) substr($data, 7);
            $product   = DB::table('sekali_products')->where('id', $productId)->first();
            if (!$product) return;

            $this->setBotState($userId, 'rs_player_id', ['product_id' => $productId]);
            $this->send($chatId, $t->get(
                'rs_enter_player',
                $product->game_name,
                $product->name,
                number_format($product->reseller_price_uzs, 0, '.', ' ')
            ));
            return;
        }

        if ($data === 'rs:orders') {
            $this->sendResellerOrders($chatId, $userId);
            return;
        }
    }

    private function placeResellerOrder(int $chatId, int $userId, int $productId, string $playerId, ?string $zoneId): void
    {
        $this->clearBotState($userId);
        $t = $this->resellerLang($userId);

        $product = DB::table('sekali_products')->where('id', $productId)->where('is_active', true)->first();
        if (!$product) {
            $this->send($chatId, "❌ Mahsulot topilmadi.");
            return;
        }

        $priceUzs     = (int) $product->reseller_price_uzs;
        $regularPrice = (int) $product->price_uzs;

        $balance = (float) (DB::table('user_balances')->where('user_id', $userId)->value('balance') ?? 0);
        if ($balance < $priceUzs) {
            $this->send($chatId, $t->get(
                'rs_no_balance',
                number_format($balance, 0, '.', ' '),
                number_format($priceUzs, 0, '.', ' '),
                number_format($priceUzs - $balance, 0, '.', ' ')
            ));
            return;
        }

        $deducted = false;
        DB::transaction(function () use ($userId, $priceUzs, &$deducted) {
            $row = DB::table('user_balances')->where('user_id', $userId)->lockForUpdate()->first();
            if (!$row || (float) $row->balance < $priceUzs) return;
            DB::table('user_balances')->where('user_id', $userId)
                ->update(['balance' => DB::raw("balance - {$priceUzs}"), 'updated_at' => now()]);
            $deducted = true;
        });

        if (!$deducted) {
            $this->send($chatId, $t->get('rs_no_balance',
                number_format($balance, 0, '.', ' '),
                number_format($priceUzs, 0, '.', ' '),
                number_format($priceUzs - $balance, 0, '.', ' ')
            ));
            return;
        }

        $refId   = (string) \Illuminate\Support\Str::uuid();
        $orderId = DB::table('sekali_orders')->insertGetId([
            'ref_id'            => $refId,
            'user_id'           => $userId,
            'sekali_product_id' => $productId,
            'game_target'       => $playerId,
            'zone_id'           => $zoneId,
            'quantity'          => 1,
            'price_uzs'         => $priceUzs,
            'regular_price_uzs' => $regularPrice,
            'price_idr'         => $product->price_idr,
            'status'            => 'pending',
            'created_at'        => now(),
            'updated_at'        => now(),
        ]);

        try {
            $api    = app(\App\Services\SekaliPayService::class);
            $result = $api->createTransaction($refId, $product->sekali_item_id, $playerId, $zoneId);

            if ($result['success']) {
                DB::table('sekali_orders')->where('id', $orderId)->update([
                    'status'         => 'processing',
                    'sekali_invoice' => $result['data']['invoice'] ?? null,
                    'updated_at'     => now(),
                ]);
                $zoneStr = $zoneId ? "\n🌐 Zone: <code>{$zoneId}</code>" : '';
                $this->send($chatId,
                    $t->get('rs_order_ok',
                        $product->game_name,
                        $product->name,
                        $playerId,
                        $zoneStr,
                        number_format($priceUzs, 0, '.', ' '),
                        number_format($regularPrice - $priceUzs, 0, '.', ' '),
                        $orderId
                    ),
                    ['inline_keyboard' => [[['text' => $t->get('rs_my_orders_btn'), 'callback_data' => 'rs:orders']]]]
                );
            } else {
                DB::table('user_balances')->where('user_id', $userId)->increment('balance', $priceUzs);
                DB::table('sekali_orders')->where('id', $orderId)->update(['status' => 'failed', 'updated_at' => now()]);
                $this->send($chatId, $t->get('rs_order_fail', $result['message'] ?? ''));
            }
        } catch (\Throwable $e) {
            DB::table('user_balances')->where('user_id', $userId)->increment('balance', $priceUzs);
            DB::table('sekali_orders')->where('id', $orderId)->update(['status' => 'failed', 'updated_at' => now()]);
            $this->send($chatId, $t->get('rs_order_err'));
            Log::error('Reseller bot order error', ['error' => $e->getMessage()]);
        }
    }

    private function sendResellerMenu(int $chatId, int $userId): void
    {
        $t       = $this->resellerLang($userId);
        $balance = (float) (DB::table('user_balances')->where('user_id', $userId)->value('balance') ?? 0);
        $webUrl  = rtrim(config('app.url'), '/') . '/reseller/balance';

        $this->send($chatId,
            $t->get('rs_menu', number_format($balance, 0, '.', ' ')),
            ['inline_keyboard' => [
                [['text' => $t->get('rs_buy_order'),  'callback_data' => 'rs:games']],
                [['text' => $t->get('rs_my_orders'),  'callback_data' => 'rs:orders']],
                [['text' => $t->get('rs_top_up'),     'web_app'       => ['url' => $webUrl]]],
            ]]
        );
    }

    private function sendResellerOrders(int $chatId, int $userId): void
    {
        $t      = $this->resellerLang($userId);
        $orders = DB::table('sekali_orders as o')
            ->leftJoin('sekali_products as p', 'p.id', '=', 'o.sekali_product_id')
            ->where('o.user_id', $userId)
            ->orderByDesc('o.created_at')
            ->limit(5)
            ->get(['o.id', 'o.status', 'o.price_uzs', 'o.game_target', 'o.created_at', 'p.game_name', 'p.name as variant']);

        if ($orders->isEmpty()) {
            $this->send($chatId, $t->get('rs_no_orders'),
                ['inline_keyboard' => [[['text' => $t->get('rs_back_menu'), 'callback_data' => 'rs:menu']]]]);
            return;
        }

        $text = $t->get('rs_orders_title');
        foreach ($orders as $o) {
            $status = $t->statusText($o->status);
            $price  = number_format($o->price_uzs, 0, '.', ' ');
            $date   = date('d.m H:i', strtotime($o->created_at));
            $text  .= "<b>SK-{$o->id}</b> {$status}\n";
            $text  .= "🎮 {$o->game_name} — {$o->variant}\n";
            $text  .= "👤 <code>{$o->game_target}</code>  💰 {$price} UZS\n";
            $text  .= "🕐 {$date}\n";
            $text  .= "─────────────────\n";
        }

        $this->send($chatId, $text,
            ['inline_keyboard' => [[['text' => $t->get('rs_back_menu'), 'callback_data' => 'rs:menu']]]]);
    }
}
