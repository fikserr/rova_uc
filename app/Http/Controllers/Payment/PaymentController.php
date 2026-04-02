<?php

namespace App\Http\Controllers\Payment;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class PaymentController extends Controller
{
    public function create(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'telegram_id' => 'nullable|integer',
            'amount' => 'nullable|numeric|min:0.01',
            'order_type' => 'nullable|in:uc,ml,service,topup',
            'product_id' => 'nullable|integer',
            'ml_account_id' => 'nullable|string|max:64',
            'ml_server_id' => 'nullable|string|max:64',
            'pubg_player_id' => 'nullable|string|max:64',
            'pubg_name' => 'nullable|string|max:64',
            'service_id' => 'nullable|integer',
            'target_telegram_username' => 'nullable|string|max:64',
            'payment_method' => 'nullable|in:balance,click,auto',
        ]);

        $userId = $validated['telegram_id'] ?? Auth::id();

        if (!$userId) {
            return response()->json([
                'message' => 'Foydalanuvchi aniqlanmadi',
            ], 422);
        }

        $orderType = $validated['order_type'] ?? 'topup';
        $paymentMethod = $validated['payment_method'] ?? 'auto';

        $context = $this->buildOrderContext($orderType, $validated, $userId);

        if ($context['error']) {
            return response()->json(['message' => $context['error']], 422);
        }

        $amount = $context['amount'];
        $currentBalance = (float) (DB::table('user_balances')->where('user_id', $userId)->value('balance') ?? 0);
        $hasEnoughBalance = $currentBalance >= $amount;

        if ($paymentMethod === 'balance' && $orderType === 'topup') {
            return response()->json([
                'message' => 'Balansni balans bilan to\'ldirib bo\'lmaydi',
            ], 422);
        }

        $resolvedMethod = $paymentMethod;
        if ($paymentMethod === 'auto') {
            $resolvedMethod = ($orderType !== 'topup' && $hasEnoughBalance) ? 'balance' : 'click';
        }

        if ($resolvedMethod === 'balance') {
            return $this->payWithBalance($userId, $orderType, $context, $amount);
        }

        return $this->payWithClick($userId, $orderType, $context, $amount);
    }

    private function buildOrderContext(string $orderType, array $validated, int $userId): array
    {
        if ($orderType === 'uc') {
            $productId = $validated['product_id'] ?? null;
            $product = DB::table('uc_products')->where('id', $productId)->first();

            if (!$product) {
                return ['error' => 'UC mahsulot topilmadi'];
            }

            $pubgPlayerId = trim((string) ($validated['pubg_player_id'] ?? ''));
            $pubgName = trim((string) ($validated['pubg_name'] ?? ''));

            if ($pubgPlayerId === '') {
                return ['error' => 'PUBG Player ID kiriting'];
            }

            $accountId = $this->resolvePubgAccountId($userId, $pubgPlayerId, $pubgName);

            return [
                'error' => null,
                'amount' => (float) $product->sell_price,
                'order_payload' => [
                    'pubg_account_id' => $accountId,
                    'product_id' => $product->id,
                    'sell_price' => $product->sell_price,
                    'sell_currency' => $product->sell_currency,
                    'cost_price' => $product->cost_price,
                    'cost_currency' => $product->cost_currency,
                    'profit_base' => max((float) $product->sell_price - (float) $product->cost_price, 0),
                ],
            ];
        }

        if ($orderType === 'ml') {
            $productId = $validated['product_id'] ?? null;
            $product = DB::table('ml_products')->where('id', $productId)->first();

            if (!$product) {
                return ['error' => 'ML mahsulot topilmadi'];
            }

            $mlAccountIdValue = trim((string) ($validated['ml_account_id'] ?? ''));
            $mlServerIdValue = trim((string) ($validated['ml_server_id'] ?? ''));

            if ($mlAccountIdValue === '' || $mlServerIdValue === '') {
                return ['error' => 'ML Account ID va Server ID kiriting'];
            }

            $accountId = $this->resolveMlAccountId($userId, $mlAccountIdValue, $mlServerIdValue);

            return [
                'error' => null,
                'amount' => (float) $product->sell_price,
                'order_payload' => [
                    'ml_account_id' => $accountId,
                    'product_id' => $product->id,
                    'sell_price' => $product->sell_price,
                    'sell_currency' => $product->sell_currency,
                    'cost_price' => $product->cost_price,
                    'cost_currency' => $product->cost_currency,
                    'profit_base' => max((float) $product->sell_price - (float) $product->cost_price, 0),
                ],
            ];
        }

        if ($orderType === 'service') {
            $serviceId = $validated['service_id'] ?? null;
            $service = DB::table('services')->where('id', $serviceId)->first();

            if (!$service) {
                return ['error' => 'Service topilmadi'];
            }

            $targetTelegramUsername = trim((string) ($validated['target_telegram_username'] ?? ''));
            if ($targetTelegramUsername === '') {
                return ['error' => 'Target Telegram username kiriting'];
            }

            return [
                'error' => null,
                'amount' => (float) $service->sell_price,
                'order_payload' => [
                    'service_id' => $service->id,
                    'target_telegram_id' => ltrim($targetTelegramUsername, '@'),
                    'sell_price' => $service->sell_price,
                    'sell_currency' => $service->sell_currency,
                    'cost_price' => $service->cost_price,
                    'cost_currency' => $service->cost_currency,
                    'profit_base' => max((float) $service->sell_price - (float) $service->cost_price, 0),
                ],
            ];
        }

        $amount = isset($validated['amount']) ? (float) $validated['amount'] : null;
        if (!$amount) {
            return ['error' => 'Amount kiritilmagan'];
        }

        return [
            'error' => null,
            'amount' => $amount,
            'order_payload' => [],
        ];
    }

    private function resolvePubgAccountId(int $userId, string $pubgPlayerId, string $pubgName): int
    {
        $existing = DB::table('pubg_accounts')
            ->where('user_id', $userId)
            ->where('pubg_player_id', $pubgPlayerId)
            ->first();

        if ($existing) {
            DB::table('pubg_accounts')
                ->where('id', $existing->id)
                ->update([
                    'pubg_name' => $pubgName !== '' ? $pubgName : $existing->pubg_name,
                ]);

            return (int) $existing->id;
        }

        return (int) DB::table('pubg_accounts')->insertGetId([
            'user_id' => $userId,
            'pubg_player_id' => $pubgPlayerId,
            'pubg_name' => $pubgName !== '' ? $pubgName : null,
        ]);
    }

    private function resolveMlAccountId(int $userId, string $mlAccountId, string $mlServerId): int
    {
        $existing = DB::table('ml_accounts')
            ->where('user_id', $userId)
            ->where('ml_account_id', $mlAccountId)
            ->where('ml_server_id', $mlServerId)
            ->first();

        if ($existing) {
            return (int) $existing->id;
        }

        return (int) DB::table('ml_accounts')->insertGetId([
            'user_id' => $userId,
            'ml_account_id' => $mlAccountId,
            'ml_server_id' => $mlServerId,
        ]);
    }

    private function payWithClick(int $userId, string $orderType, array $context, float $amount): JsonResponse
    {
        $orderId = 0;

        if ($orderType === 'uc') {
            $orderId = DB::table('uc_orders')->insertGetId([
                'user_id' => $userId,
                ...$context['order_payload'],
                'status' => 'pending',
                'created_at' => now(),
            ]);
        }

        if ($orderType === 'ml') {
            $orderId = DB::table('ml_orders')->insertGetId([
                'user_id' => $userId,
                ...$context['order_payload'],
                'status' => 'pending',
                'created_at' => now(),
            ]);
        }

        if ($orderType === 'service') {
            $orderId = DB::table('service_orders')->insertGetId([
                'user_id' => $userId,
                ...$context['order_payload'],
                'status' => 'pending',
                'created_at' => now(),
            ]);
        }

        $merchantTransId = "u:{$userId}|t:{$orderType}|o:{$orderId}|ts:" . now()->timestamp;
        $returnUrl = $this->buildClickReturnUrl($orderType, $orderId);

        $params = [
            'service_id' => env('CLICK_SERVICE_ID'),
            'merchant_id' => env('CLICK_MERCHANT_ID'),
            'amount' => $amount,
            'transaction_param' => $merchantTransId,
            'return_url' => $returnUrl,
        ];

        $paymentUrl = 'https://my.click.uz/services/pay?' . http_build_query($params);

        return response()->json([
            'payment_url' => $paymentUrl,
            'selected_method' => 'click',
        ]);
    }

    private function buildClickReturnUrl(string $orderType, int $orderId): string
    {
        // If explicitly configured, always trust this value.
        $explicitUrl = env('TELEGRAM_MINIAPP_RETURN_URL');
        if (!empty($explicitUrl)) {
            return $explicitUrl;
        }

        // Telegram deep link back to bot mini app.
        $botUsername = env('TELEGRAM_BOT_USERNAME');
        if (!empty($botUsername)) {
            $startParam = "paid_{$orderType}_{$orderId}";
            $shortName = env('TELEGRAM_MINIAPP_SHORT_NAME');

            if (!empty($shortName)) {
                return "https://t.me/{$botUsername}/{$shortName}?startapp={$startParam}";
            }

            return "https://t.me/{$botUsername}?startapp={$startParam}";
        }

        // Last fallback: return to web app home.
        return url('/user-services');
    }

    private function payWithBalance(int $userId, string $orderType, array $context, float $amount): JsonResponse
    {
        $result = DB::transaction(function () use ($userId, $orderType, $context, $amount) {
            $balanceRow = DB::table('user_balances')
                ->where('user_id', $userId)
                ->lockForUpdate()
                ->first();

            $currentBalance = (float) ($balanceRow?->balance ?? 0);

            if ($currentBalance < $amount) {
                return ['error' => 'Balans yetarli emas'];
            }

            $orderId = 0;

            if ($orderType === 'uc') {
                $orderId = DB::table('uc_orders')->insertGetId([
                    'user_id' => $userId,
                    ...$context['order_payload'],
                    'status' => 'paid',
                    'created_at' => now(),
                ]);
            }

            if ($orderType === 'ml') {
                $orderId = DB::table('ml_orders')->insertGetId([
                    'user_id' => $userId,
                    ...$context['order_payload'],
                    'status' => 'paid',
                    'created_at' => now(),
                ]);
            }

            if ($orderType === 'service') {
                $orderId = DB::table('service_orders')->insertGetId([
                    'user_id' => $userId,
                    ...$context['order_payload'],
                    'status' => 'paid',
                    'created_at' => now(),
                ]);
            }

            $newBalance = $currentBalance - $amount;

            if ($balanceRow) {
                DB::table('user_balances')
                    ->where('user_id', $userId)
                    ->update([
                        'balance' => $newBalance,
                        'updated_at' => now(),
                    ]);
            } else {
                DB::table('user_balances')->insert([
                    'user_id' => $userId,
                    'balance' => $newBalance,
                    'updated_at' => now(),
                ]);
            }

            DB::table('payments')->insert([
                'user_id' => $userId,
                'click_trans_id' => 'BAL-' . $userId . '-' . now()->timestamp . '-' . random_int(1000, 9999),
                'amount' => $amount,
                'currency' => 'UZS',
                'provider' => 'balance',
                'status' => 'paid',
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            return [
                'error' => null,
                'order_id' => $orderId,
                'new_balance' => $newBalance,
            ];
        });

        if ($result['error']) {
            return response()->json([
                'message' => $result['error'],
            ], 422);
        }

        return response()->json([
            'paid_with' => 'balance',
            'selected_method' => 'balance',
            'order_type' => $orderType,
            'order_id' => $result['order_id'],
            'new_balance' => $result['new_balance'],
            'message' => 'Balansdan muvaffaqiyatli to\'landi',
        ]);
    }

    public function status(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'order_type' => 'required|in:uc,ml,service',
            'order_id' => 'required|integer|min:1',
        ]);

        $userId = Auth::id();
        if (!$userId) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $table = match ($validated['order_type']) {
            'uc' => 'uc_orders',
            'ml' => 'ml_orders',
            'service' => 'service_orders',
        };

        $order = DB::table($table)
            ->where('id', $validated['order_id'])
            ->where('user_id', $userId)
            ->first();

        if (!$order) {
            return response()->json(['message' => 'Order topilmadi'], 404);
        }

        return response()->json([
            'order_type' => $validated['order_type'],
            'order_id' => (int) $validated['order_id'],
            'status' => $order->status,
            'paid' => in_array($order->status, ['paid', 'delivered'], true),
        ]);
    }
}
