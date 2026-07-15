<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class BinancePayService
{
    private string $apiKey;
    private string $secretKey;
    private string $baseUrl = 'https://bpay.binanceapi.com';

    public function __construct()
    {
        $this->apiKey    = config('services.binance.api_key', '');
        $this->secretKey = config('services.binance.secret_key', '');
    }

    public function createOrder(string $merchantTradeNo, float $amountUsdt, string $returnUrl): array
    {
        $timestamp = (int) (microtime(true) * 1000);
        $nonce     = Str::random(32);

        $payload = [
            'env'             => ['terminalType' => 'WEB'],
            'merchantTradeNo' => $merchantTradeNo,
            'orderAmount'     => number_format($amountUsdt, 2, '.', ''),
            'currency'        => 'USDT',
            'description'     => 'Balance top-up',
            'goodsDetails'    => [[
                'goodsType'        => '02',
                'goodsCategory'    => 'Z000',
                'referenceGoodsId' => 'BALANCE',
                'goodsName'        => 'Balance Top-up',
                'goodsDetail'      => 'Balance Top-up',
            ]],
            'returnUrl' => $returnUrl,
            'cancelUrl' => $returnUrl,
        ];

        $body      = json_encode($payload);
        $signature = $this->sign($timestamp, $nonce, $body);

        try {
            $response = Http::withHeaders([
                'Content-Type'              => 'application/json',
                'BinancePay-Timestamp'      => (string) $timestamp,
                'BinancePay-Nonce'          => $nonce,
                'BinancePay-Certificate-SN' => $this->apiKey,
                'BinancePay-Signature'      => $signature,
            ])->timeout(15)->post("{$this->baseUrl}/binancepay/openapi/v3/order", $payload);

            $data = $response->json() ?? [];

            Log::info('BinancePay createOrder', [
                'status'   => $response->status(),
                'response' => $data,
            ]);

            if (($data['status'] ?? '') !== 'SUCCESS') {
                return ['success' => false, 'message' => $data['errorMessage'] ?? 'Binance Pay xatolik'];
            }

            return [
                'success'      => true,
                'prepayId'     => $data['data']['prepayId']     ?? '',
                'checkoutUrl'  => $data['data']['checkoutUrl']  ?? '',
                'universalUrl' => $data['data']['universalUrl'] ?? '',
            ];
        } catch (\Throwable $e) {
            Log::error('BinancePay createOrder error', ['error' => $e->getMessage()]);
            return ['success' => false, 'message' => 'Ulanishda xatolik'];
        }
    }

    public function verifyWebhook(string $body, string $signature, string $timestamp, string $nonce): bool
    {
        if (!$this->secretKey || !$signature) {
            return false;
        }
        $expected = $this->sign((int) $timestamp, $nonce, $body);
        return hash_equals($expected, strtoupper($signature));
    }

    private function sign(int $timestamp, string $nonce, string $body): string
    {
        $payload = "{$timestamp}\n{$nonce}\n{$body}\n";
        return strtoupper(hash_hmac('sha512', $payload, $this->secretKey));
    }
}
