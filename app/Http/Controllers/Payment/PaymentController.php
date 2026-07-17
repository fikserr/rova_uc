<?php

namespace App\Http\Controllers\Payment;

use App\Http\Controllers\Controller;
use App\Jobs\ProcessFragmentServiceOrder;
use App\Models\PromoCode;
use App\Models\Promotion;
use App\Services\AdminOrderNotificationService;
use App\Services\WorkerNotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class PaymentController extends Controller
{
    public function create(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'amount'                    => 'nullable|numeric|min:1000|max:50000000',
            'order_type'                => 'nullable|in:uc,ml,service,topup,bundle',
            'product_id'                => 'nullable|integer',
            'bundle_id'                 => 'nullable|integer',
            'ml_account_id'             => 'nullable|string|max:64',
            'ml_server_id'              => 'nullable|string|max:64',
            'pubg_player_id'            => 'nullable|string|max:64',
            'pubg_name'                 => 'nullable|string|max:64',
            'service_id'                => 'nullable|integer',
            'target_telegram_username'  => 'nullable|string|max:64',
            'payment_method'            => 'nullable|in:balance,click,auto',
            'promo_code'                => 'nullable|string|max:50',
        ]);

        $userId = Auth::id();

        if (!$userId) {
            return response()->json([
                'message' => __('payment.user_not_found'),
            ], 422);
        }

        $orderType = $validated['order_type'] ?? 'topup';
        $paymentMethod = $validated['payment_method'] ?? 'auto';

        $context = $this->buildOrderContext($orderType, $validated, $userId);

        if ($context['error']) {
            return response()->json(['message' => $context['error']], 422);
        }

        $amount = $context['amount'];

        // Apply promo code or active promotion discount
        $promoCodeId   = null;
        $discountLabel = null;
        $promoCodeStr  = trim((string) ($validated['promo_code'] ?? ''));

        if ($promoCodeStr !== '' && $orderType !== 'topup') {
            $promo = PromoCode::where('code', strtoupper($promoCodeStr))->first();
            if (!$promo || !$promo->isValid($amount)) {
                return response()->json(['message' => "Promo kod yaroqsiz yoki muddati o'tgan"], 422);
            }
            $discount = $promo->discount_type === 'percent'
                ? $amount * $promo->discount_value / 100
                : (float) $promo->discount_value;
            $discount      = min($discount, $amount);
            $amount        = round($amount - $discount, 2);
            $promoCodeId   = $promo->id;
            $discountLabel = $promo->discount_type === 'percent'
                ? "{$promo->discount_value}% promo kod chegirmasi"
                : number_format($promo->discount_value, 0, '.', ' ') . " UZS promo kod chegirmasi";
        } elseif ($orderType !== 'topup') {
            $promoType  = match ($orderType) {
                'uc', 'bundle' => 'uc',
                'service'      => 'service',
                default        => null,
            };
            if ($promoType) {
                $promotion = Promotion::active()
                    ->where(fn ($q) => $q->where('applies_to', $promoType)->orWhere('applies_to', 'all'))
                    ->orderByDesc('discount_percent')
                    ->first();
                if ($promotion) {
                    $discount      = $amount * $promotion->discount_percent / 100;
                    $amount        = round(max(0, $amount - $discount), 2);
                    $discountLabel = "Aksiya: {$promotion->title} ({$promotion->discount_percent}%)";
                }
            }
        }

        $currentBalance = (float) (DB::table('user_balances')->where('user_id', $userId)->value('balance') ?? 0);
        $hasEnoughBalance = $currentBalance >= $amount;

        if ($paymentMethod === 'balance' && $orderType === 'topup') {
            return response()->json([
                'message' => __('payment.cannot_topup_with_balance'),
            ], 422);
        }

        $resolvedMethod = $paymentMethod;
        if ($paymentMethod === 'auto') {
            $resolvedMethod = ($orderType !== 'topup' && $hasEnoughBalance) ? 'balance' : 'click';
        }

        if ($resolvedMethod === 'balance') {
            $response = $this->payWithBalance($userId, $orderType, $context, $amount);
            if ($promoCodeId && $response->getStatusCode() === 200) {
                DB::table('promo_codes')->where('id', $promoCodeId)->increment('uses_count');
            }
            return $response;
        }

        $response = $this->payWithClick($userId, $orderType, $context, $amount);
        if ($promoCodeId && $response->getStatusCode() === 200) {
            DB::table('promo_codes')->where('id', $promoCodeId)->increment('uses_count');
        }
        return $response;
    }

    private function buildOrderContext(string $orderType, array $validated, int $userId): array
    {
        if ($orderType === 'uc') {
            $productId = $validated['product_id'] ?? null;
            $product = DB::table('uc_products')->where('id', $productId)->first();

            if (!$product) {
                return ['error' => __('payment.uc_product_not_found')];
            }

            $pubgPlayerId = trim((string) ($validated['pubg_player_id'] ?? ''));
            $pubgName = trim((string) ($validated['pubg_name'] ?? ''));

            if ($pubgPlayerId === '') {
                return ['error' => __('payment.enter_pubg_player_id')];
            }

            $pricing = $this->calculateBasePricing(
                (float) $product->sell_price,
                (string) $product->sell_currency,
                (float) $product->cost_price,
                (string) $product->cost_currency
            );

            if ($pricing['error']) {
                return ['error' => $pricing['error']];
            }

            $accountId = $this->resolvePubgAccountId($userId, $pubgPlayerId, $pubgName);

            return [
                'error' => null,
                'amount' => (float) $pricing['sell_base'],
                'order_payload' => [
                    'pubg_account_id' => $accountId,
                    'product_id' => $product->id,
                    'sell_price' => $pricing['sell_base'],
                    'sell_currency' => 'UZS',
                    'cost_price' => $product->cost_price,
                    'cost_currency' => $product->cost_currency,
                    'profit_base' => $pricing['profit_base'],
                ],
            ];
        }

        if ($orderType === 'ml') {
            $productId = $validated['product_id'] ?? null;
            $product = DB::table('ml_products')->where('id', $productId)->first();

            if (!$product) {
                return ['error' => __('payment.ml_product_not_found')];
            }

            $mlAccountIdValue = trim((string) ($validated['ml_account_id'] ?? ''));
            $mlServerIdValue = trim((string) ($validated['ml_server_id'] ?? ''));

            if ($mlAccountIdValue === '' || $mlServerIdValue === '') {
                return ['error' => __('payment.enter_ml_account_info')];
            }

            $pricing = $this->calculateBasePricing(
                (float) $product->sell_price,
                (string) $product->sell_currency,
                (float) $product->cost_price,
                (string) $product->cost_currency
            );

            if ($pricing['error']) {
                return ['error' => $pricing['error']];
            }

            $accountId = $this->resolveMlAccountId($userId, $mlAccountIdValue, $mlServerIdValue);

            return [
                'error' => null,
                'amount' => (float) $pricing['sell_base'],
                'order_payload' => [
                    'ml_account_id' => $accountId,
                    'product_id' => $product->id,
                    'sell_price' => $pricing['sell_base'],
                    'sell_currency' => 'UZS',
                    'cost_price' => $product->cost_price,
                    'cost_currency' => $product->cost_currency,
                    'profit_base' => $pricing['profit_base'],
                ],
            ];
        }

        if ($orderType === 'service') {
            $serviceId = $validated['service_id'] ?? null;
            $service = DB::table('services')->where('id', $serviceId)->first();

            if (!$service) {
                return ['error' => __('payment.service_not_found')];
            }

            $targetTelegramUsername = trim((string) ($validated['target_telegram_username'] ?? ''));
            if ($targetTelegramUsername === '') {
                return ['error' => __('payment.enter_telegram_username')];
            }

            $targetTelegramUsername = ltrim($targetTelegramUsername, '@');

            // Agar raqamli ID kiritilgan bo'lsa, users jadvalidan username topamiz
            if (is_numeric($targetTelegramUsername)) {
                $resolvedUsername = DB::table('users')
                    ->where('id', (int) $targetTelegramUsername)
                    ->value('username');
                if ($resolvedUsername) {
                    $targetTelegramUsername = (string) $resolvedUsername;
                }
            }

            $pricing = $this->calculateBasePricing(
                (float) $service->sell_price,
                (string) $service->sell_currency,
                (float) $service->cost_price,
                (string) $service->cost_currency
            );

            if ($pricing['error']) {
                return ['error' => $pricing['error']];
            }

            return [
                'error' => null,
                'amount' => (float) $pricing['sell_base'],
                'order_payload' => [
                    'service_id' => $service->id,
                    'target_telegram_id' => $targetTelegramUsername,
                    'sell_price' => $pricing['sell_base'],
                    'sell_currency' => 'UZS',
                    'cost_price' => $service->cost_price,
                    'cost_currency' => $service->cost_currency,
                    'profit_base' => $pricing['profit_base'],
                ],
            ];
        }

        if ($orderType === 'bundle') {
            $bundleId = $validated['bundle_id'] ?? null;
            $bundle = DB::table('uc_bundles')->where('id', $bundleId)->where('is_active', true)->first();

            if (!$bundle) {
                return ['error' => __('payment.uc_product_not_found')];
            }

            $pubgPlayerId = trim((string) ($validated['pubg_player_id'] ?? ''));
            $pubgName     = trim((string) ($validated['pubg_name'] ?? ''));

            if ($pubgPlayerId === '') {
                return ['error' => __('payment.enter_pubg_player_id')];
            }

            $pricing = $this->calculateBasePricing(
                (float) $bundle->sell_price,
                (string) $bundle->sell_currency,
                (float) $bundle->cost_price,
                (string) $bundle->cost_currency
            );

            if ($pricing['error']) {
                return ['error' => $pricing['error']];
            }

            $accountId = $this->resolvePubgAccountId($userId, $pubgPlayerId, $pubgName);

            return [
                'error'  => null,
                'amount' => (float) $pricing['sell_base'],
                'order_payload' => [
                    'pubg_account_id' => $accountId,
                    'bundle_id'       => $bundle->id,
                    'sell_price'      => $pricing['sell_base'],
                    'sell_currency'   => 'UZS',
                    'cost_price'      => $bundle->cost_price,
                    'cost_currency'   => $bundle->cost_currency,
                    'profit_base'     => $pricing['profit_base'],
                ],
            ];
        }

        $amount = isset($validated['amount']) ? (float) $validated['amount'] : null;
        if (!$amount) {
            return ['error' => __('payment.amount_required')];
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

        if ($orderType === 'bundle') {
            $orderId = DB::table('bundle_orders')->insertGetId([
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
                return ['error' => __('payment.insufficient_balance')];
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

            if ($orderType === 'bundle') {
                $orderId = DB::table('bundle_orders')->insertGetId([
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

        if ($orderType !== 'topup' && $result['order_id'] > 0) {
            AdminOrderNotificationService::notifyNewOrder($orderType, $result['order_id']);
            WorkerNotificationService::notifyNewOrder($orderType, $result['order_id']);

            if ($orderType === 'service') {
                ProcessFragmentServiceOrder::dispatch($result['order_id']);
            }
        }

        return response()->json([
            'paid_with' => 'balance',
            'selected_method' => 'balance',
            'order_type' => $orderType,
            'order_id' => $result['order_id'],
            'new_balance' => $result['new_balance'],
            'message' => __('payment.paid_with_balance'),
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
            return response()->json(['message' => __('payment.order_not_found')], 404);
        }

        return response()->json([
            'order_type' => $validated['order_type'],
            'order_id' => (int) $validated['order_id'],
            'status' => $order->status,
            'paid' => in_array($order->status, ['paid', 'delivered'], true),
        ]);
    }

    private function calculateBasePricing(
        float $sellPrice,
        string $sellCurrency,
        float $costPrice,
        string $costCurrency
    ): array {
        $sellBase = $this->convertToBaseUzs($sellPrice, $sellCurrency);
        if ($sellBase === null) {
            return ['error' => __('payment.currency_rate_not_found', ['currency' => strtoupper($sellCurrency)])];
        }

        $costBase = $this->convertToBaseUzs($costPrice, $costCurrency);
        if ($costBase === null) {
            return ['error' => __('payment.currency_rate_not_found', ['currency' => strtoupper($costCurrency)])];
        }

        return [
            'error' => null,
            'sell_base' => round($sellBase, 2),
            'cost_base' => round($costBase, 2),
            'profit_base' => round($sellBase - $costBase, 2),
        ];
    }

    private function convertToBaseUzs(float $amount, string $currencyCode): ?float
    {
        $code = strtoupper(trim($currencyCode));

        if ($code === '' || $code === 'UZS') {
            return $amount;
        }

        $rate = DB::table('currency_rates')
            ->where('currency_code', $code)
            ->orderByDesc('id')
            ->value('rate_to_base');

        if ($rate === null) {
            return null;
        }

        return $amount * (float) $rate;
    }
}
