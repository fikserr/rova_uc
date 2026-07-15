<?php

namespace App\Http\Controllers\Payment;

use App\Http\Controllers\Controller;
use App\Services\BinancePayService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;

class BinanceController extends Controller
{
    public function rate(): JsonResponse
    {
        $rate = (float) (DB::table('currency_rates')
            ->where('currency_code', 'USDT')
            ->orderByDesc('id')
            ->value('rate_to_base') ?? 0);

        return response()->json(['rate' => $rate]);
    }

    public function create(Request $request, BinancePayService $binance): JsonResponse
    {
        $data = $request->validate([
            'amount_uzs' => 'required|numeric|min:10000|max:50000000',
        ]);

        $userId    = auth()->id();
        $amountUzs = (int) $data['amount_uzs'];

        $usdtRate = (float) (DB::table('currency_rates')
            ->where('currency_code', 'USDT')
            ->orderByDesc('id')
            ->value('rate_to_base') ?? 0);

        if ($usdtRate <= 0) {
            return response()->json(['message' => 'USDT kurs topilmadi. Admin bilan bog\'laning.'], 422);
        }

        $amountUsdt      = round($amountUzs / $usdtRate, 2);
        $merchantTradeNo = 'BPY-' . $userId . '-' . now()->getTimestampMs();
        $returnUrl       = url('/user-profile/user-balance');

        $result = $binance->createOrder($merchantTradeNo, $amountUsdt, $returnUrl);

        if (!$result['success']) {
            return response()->json(['message' => $result['message']], 422);
        }

        DB::table('binance_payments')->insert([
            'user_id'           => $userId,
            'merchant_trade_no' => $merchantTradeNo,
            'prepay_id'         => $result['prepayId'],
            'amount_uzs'        => $amountUzs,
            'amount_usdt'       => $amountUsdt,
            'status'            => 'pending',
            'created_at'        => now(),
            'updated_at'        => now(),
        ]);

        return response()->json(['checkout_url' => $result['checkoutUrl']]);
    }

    public function webhook(Request $request, BinancePayService $binance): \Illuminate\Http\Response
    {
        $body      = $request->getContent();
        $signature = $request->header('BinancePay-Signature', '');
        $timestamp = $request->header('BinancePay-Timestamp', '');
        $nonce     = $request->header('BinancePay-Nonce', '');

        if (!$binance->verifyWebhook($body, $signature, $timestamp, $nonce)) {
            Log::warning('BinancePay webhook: invalid signature', [
                'signature' => $signature,
                'timestamp' => $timestamp,
            ]);
            return response('Unauthorized', 401);
        }

        $payload   = json_decode($body, true) ?? [];
        $bizType   = $payload['bizType']   ?? '';
        $bizStatus = $payload['bizStatus'] ?? '';
        $data      = json_decode($payload['data'] ?? '{}', true) ?? [];

        $merchantTradeNo = $data['merchantTradeNo'] ?? null;

        Log::info('BinancePay webhook', [
            'bizType'         => $bizType,
            'bizStatus'       => $bizStatus,
            'merchantTradeNo' => $merchantTradeNo,
        ]);

        if ($bizType !== 'PAY' || $bizStatus !== 'PAY_SUCCESS' || !$merchantTradeNo) {
            return response()->json(['returnCode' => 'SUCCESS', 'returnMessage' => null]);
        }

        DB::transaction(function () use ($merchantTradeNo) {
            $payment = DB::table('binance_payments')
                ->where('merchant_trade_no', $merchantTradeNo)
                ->where('status', 'pending')
                ->lockForUpdate()
                ->first();

            if (!$payment) {
                return;
            }

            DB::table('binance_payments')
                ->where('id', $payment->id)
                ->update(['status' => 'paid', 'updated_at' => now()]);

            $userId    = (int) $payment->user_id;
            $amountUzs = (float) $payment->amount_uzs;

            $balanceRow = DB::table('user_balances')->where('user_id', $userId)->lockForUpdate()->first();

            if ($balanceRow) {
                DB::table('user_balances')->where('user_id', $userId)->update([
                    'balance'    => (float) $balanceRow->balance + $amountUzs,
                    'updated_at' => now(),
                ]);
            } else {
                DB::table('user_balances')->insert([
                    'user_id'    => $userId,
                    'balance'    => $amountUzs,
                    'updated_at' => now(),
                ]);
            }

            DB::table('payments')->insert([
                'user_id'        => $userId,
                'click_trans_id' => 'BNB-' . $merchantTradeNo,
                'amount'         => $amountUzs,
                'currency'       => 'UZS',
                'provider'       => 'binance',
                'status'         => 'paid',
                'created_at'     => now(),
                'updated_at'     => now(),
            ]);

            if (Schema::hasTable('user_notifications')) {
                DB::table('user_notifications')->insert([
                    'user_id'     => $userId,
                    'source'      => 'system',
                    'order_type'  => null,
                    'order_id'    => null,
                    'status'      => null,
                    'title'       => "✅ Balans to'ldirildi",
                    'message'     => number_format($amountUzs, 0, '.', ' ') . " so'm balansingizga qo'shildi (Binance Pay).",
                    'description' => null,
                    'is_read'     => false,
                    'created_at'  => now(),
                ]);
            }

            Log::info('BinancePay: balans qo\'shildi', [
                'user_id'           => $userId,
                'amount_uzs'        => $amountUzs,
                'merchant_trade_no' => $merchantTradeNo,
            ]);
        });

        return response()->json(['returnCode' => 'SUCCESS', 'returnMessage' => null]);
    }
}
