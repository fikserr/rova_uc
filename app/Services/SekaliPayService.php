<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SekaliPayService
{
    private string $apiKey;
    private string $baseUrl;

    public function __construct()
    {
        $this->apiKey  = config('services.sekalipay.api_key', '');
        $this->baseUrl = config('services.sekalipay.base_url', 'https://sekalipay.com/api');
    }

    private function http()
    {
        return Http::withHeaders([
            'X-APIKEY' => $this->apiKey,
            'Accept'   => 'application/json',
        ])->timeout(30);
    }

    public function getItems(array $params = []): array
    {
        $response = $this->http()->get("{$this->baseUrl}/v1/item", $params);

        if (!$response->successful()) {
            Log::error('SekaliPay getItems failed', ['status' => $response->status(), 'body' => $response->body()]);
            return ['data' => [], 'meta' => null];
        }

        return [
            'data' => $response->json('data', []),
            'meta' => $response->json('meta'),
        ];
    }

    public function validateAccount(int $itemId, string $target, ?string $zoneId = null): array
    {
        $payload = ['item_id' => $itemId, 'customer_id' => $target];
        if ($zoneId) {
            $payload['zone_id'] = $zoneId;
        }

        $response = $this->http()
            ->withHeaders(['Content-Type' => 'application/json'])
            ->post("{$this->baseUrl}/v1/item/validate", $payload);

        $json = $response->json() ?? [];

        Log::info('SekaliPay validateAccount raw', ['status' => $response->status(), 'body' => $json]);

        // SekalıPay may nest data under 'data' or return it at the top level
        $data = isset($json['data']) && is_array($json['data']) ? $json['data'] : $json;

        return [
            'success' => $response->successful(),
            'data'    => $data,
            'message' => $json['message'] ?? '',
        ];
    }

    public function createTransaction(string $refId, int $itemId, string $target, ?string $zoneId = null, int $qty = 1): array
    {
        $cart = [
            'item_id'  => $itemId,
            'quantity' => $qty,
            'note'     => $target,
        ];
        if ($zoneId) {
            $cart['zone_id'] = $zoneId;
        }

        $payload = [
            'ref_id' => $refId,
            'carts'  => [$cart],
        ];

        $response = $this->http()
            ->withHeaders(['Content-Type' => 'application/json'])
            ->post("{$this->baseUrl}/v1/trx", $payload);

        if (!$response->successful()) {
            Log::error('SekaliPay createTransaction failed', [
                'ref_id' => $refId,
                'status' => $response->status(),
                'body'   => $response->body(),
            ]);
            return ['success' => false, 'message' => $response->json('message', 'API error')];
        }

        return ['success' => true, 'data' => $response->json('data', [])];
    }

    public function getTransaction(string $refId): array
    {
        $response = $this->http()->get("{$this->baseUrl}/v1/trx/{$refId}");

        return [
            'success' => $response->successful(),
            'data'    => $response->json('data', []),
        ];
    }

    public function getBalance(): array
    {
        $response = $this->http()->get("{$this->baseUrl}/v1/balance");

        return [
            'success' => $response->successful(),
            'data'    => $response->json('data', []),
        ];
    }

    public function verifyWebhookSignature(string $body, string $signature, string $timestamp): bool
    {
        $secret = config('services.sekalipay.webhook_secret');
        if (empty($secret)) {
            // Fail closed — reject all webhook calls when secret is not configured
            return false;
        }

        $expected = hash_hmac('sha256', $timestamp . $body, $secret);
        return hash_equals($expected, $signature);
    }
}
