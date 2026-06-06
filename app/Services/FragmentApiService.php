<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class FragmentApiService
{
    private const BASE_URL = 'https://fragment-api.net';
    private const MAX_CHECK_ATTEMPTS = 8;
    private const CHECK_DELAY_MS = 3000;

    private string $authKey;
    private string $walletType;

    public function __construct()
    {
        $this->authKey = (string) config('services.fragment.auth_key', '');
        $this->walletType = (string) config('services.fragment.wallet_type', 'v4r2');
    }

    public function isConfigured(): bool
    {
        return $this->authKey !== '';
    }

    public function buyStars(string $username, int $amount): array
    {
        $created = $this->createOrder('buyStarsWithoutKYC', [
            'username' => $username,
            'amount' => $amount,
            'payment_method' => 'ton',
        ]);

        if (!$created['success']) {
            return $created;
        }

        return $this->payAndCheck('buyStarsWithoutKYC', $created);
    }

    public function buyPremium(string $username, int $months): array
    {
        $created = $this->createOrder('buyPremiumWithoutKYC', [
            'username' => $username,
            'duration' => $months,
            'payment_method' => 'ton',
        ]);

        if (!$created['success']) {
            return $created;
        }

        return $this->payAndCheck('buyPremiumWithoutKYC', $created);
    }

    private function createOrder(string $type, array $payload): array
    {
        try {
            $response = Http::timeout(30)->post(self::BASE_URL . "/v2/{$type}/create", $payload);
            $data = $response->json();

            if (!($data['success'] ?? false)) {
                return [
                    'success' => false,
                    'uuid' => null,
                    'error' => $data['message'] ?? 'Fragment create order failed',
                ];
            }

            return [
                'success' => true,
                'uuid' => (string) ($data['order_id'] ?? ''),
                'cost' => (float) ($data['cost'] ?? 0),
                'error' => null,
            ];
        } catch (\Throwable $e) {
            Log::error('Fragment create order exception', ['type' => $type, 'error' => $e->getMessage()]);
            return ['success' => false, 'uuid' => null, 'error' => $e->getMessage()];
        }
    }

    private function payAndCheck(string $type, array $created): array
    {
        try {
            $payResponse = Http::timeout(60)->post(self::BASE_URL . "/v2/{$type}/pay", [
                'order_uuid' => $created['uuid'],
                'auth_key' => $this->authKey,
                'cost' => $created['cost'],
                'wallet_type' => $this->walletType,
            ]);

            $payData = $payResponse->json();

            if (!($payData['success'] ?? false)) {
                return [
                    'success' => false,
                    'uuid' => $created['uuid'],
                    'error' => $payData['message'] ?? 'Fragment pay failed',
                ];
            }

            // WithoutKYC pay returns immediate confirmation
            if (str_contains(strtolower((string) ($payData['message'] ?? '')), 'completed')) {
                return ['success' => true, 'uuid' => $created['uuid'], 'error' => null];
            }
        } catch (\Throwable $e) {
            Log::error('Fragment pay exception', ['type' => $type, 'uuid' => $created['uuid'], 'error' => $e->getMessage()]);
            return ['success' => false, 'uuid' => $created['uuid'], 'error' => $e->getMessage()];
        }

        // Poll for confirmation if pay didn't confirm immediately
        for ($attempt = 0; $attempt < self::MAX_CHECK_ATTEMPTS; $attempt++) {
            if ($attempt > 0) {
                usleep(self::CHECK_DELAY_MS * 1000);
            }

            try {
                $checkResponse = Http::timeout(15)->get(self::BASE_URL . "/v2/{$type}/check", [
                    'uuid' => $created['uuid'],
                ]);

                $checkData = $checkResponse->json();
                $status = (string) ($checkData['status'] ?? '');

                if ($status === 'success') {
                    return ['success' => true, 'uuid' => $created['uuid'], 'error' => null];
                }

                if (in_array($status, ['failed', 'canceled', 'error'], true)) {
                    return [
                        'success' => false,
                        'uuid' => $created['uuid'],
                        'error' => "Fragment order status: {$status}",
                    ];
                }
            } catch (\Throwable $e) {
                Log::warning('Fragment check attempt failed', [
                    'type' => $type,
                    'uuid' => $created['uuid'],
                    'attempt' => $attempt + 1,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        return [
            'success' => false,
            'uuid' => $created['uuid'],
            'error' => 'Fragment order not confirmed after ' . self::MAX_CHECK_ATTEMPTS . ' attempts',
        ];
    }

    /**
     * Resolve Telegram username from target_telegram_id.
     * If it's a numeric ID, look up the username from users table.
     */
    private function resolveUsername(string $targetTelegramId): string
    {
        if (is_numeric($targetTelegramId)) {
            $user = DB::table('users')
                ->where('id', (int) $targetTelegramId)
                ->value('username');

            if ($user) {
                return (string) $user;
            }
        }

        return ltrim($targetTelegramId, '@');
    }

    public function processServiceOrder(int $serviceOrderId): void
    {
        $order = DB::table('service_orders as o')
            ->join('services as s', 's.id', '=', 'o.service_id')
            ->where('o.id', $serviceOrderId)
            ->select('o.id', 'o.user_id', 'o.target_telegram_id', 'o.status', 's.service_type', 's.value')
            ->first();

        if (!$order) {
            Log::error('FragmentApiService: service_order not found', ['id' => $serviceOrderId]);
            return;
        }

        if ($order->status !== 'paid') {
            Log::warning('FragmentApiService: order not in paid status, skipping', [
                'id' => $serviceOrderId,
                'status' => $order->status,
            ]);
            return;
        }

        $username = $this->resolveUsername((string) $order->target_telegram_id);

        $result = match ($order->service_type) {
            'stars' => $this->buyStars($username, (int) $order->value),
            'premium' => $this->buyPremium($username, (int) $order->value),
            default => ['success' => false, 'uuid' => null, 'error' => "Unknown service_type: {$order->service_type}"],
        };

        if ($result['success']) {
            DB::table('service_orders')->where('id', $serviceOrderId)->update([
                'status' => 'delivered',
                'fragment_order_uuid' => $result['uuid'],
                'fragment_error' => null,
            ]);
        } else {
            Log::error('FragmentApiService: order processing failed', [
                'id' => $serviceOrderId,
                'username' => $username,
                'error' => $result['error'],
            ]);

            DB::table('service_orders')->where('id', $serviceOrderId)->update([
                'fragment_order_uuid' => $result['uuid'],
                'fragment_error' => $result['error'],
            ]);
        }
    }
}
