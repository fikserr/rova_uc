<?php

namespace App\Http\Controllers\Payment;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\User;
use App\Models\UserBalance;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ClickController extends Controller
{
    public function prepare(Request $request)
    {
        $payload = $this->parseMerchantTransId((string) $request->merchant_trans_id);
        $merchantPrepareId = $payload['order_id'] > 0
            ? $payload['order_id']
            : ((int) $request->click_trans_id ?: time());

        return response()->json([
            'click_trans_id' => $request->click_trans_id,
            'merchant_trans_id' => $request->merchant_trans_id,
            'merchant_prepare_id' => $merchantPrepareId,
            'error' => 0,
            'error_note' => 'Success',
        ]);
    }

    public function complete(Request $request)
    {
        $merchantTransId = (string) $request->merchant_trans_id;
        $amount = (float) $request->amount;
        $clickTransId = (string) $request->click_trans_id;

        $payload = $this->parseMerchantTransId($merchantTransId);
        $telegramId = $payload['user_id'];
        $orderType = $payload['order_type'];
        $orderId = $payload['order_id'];

        $user = User::find($telegramId);

        if (!$user) {
            return response()->json([
                'error' => -5,
                'error_note' => 'User not found',
            ]);
        }

        $payment = Payment::where('click_trans_id', $clickTransId)->first();

        if ($payment) {
            return response()->json([
                'error' => 0,
                'error_note' => 'Already paid',
            ]);
        }

        Payment::create([
            'user_id' => $user->id,
            'amount' => $amount,
            'currency' => 'UZS',
            'provider' => 'click',
            'click_trans_id' => $clickTransId,
            'status' => 'paid',
            'created_at' => now(),
        ]);

        if ($orderType === 'uc' && $orderId > 0) {
            DB::table('uc_orders')
                ->where('id', $orderId)
                ->where('user_id', $user->id)
                ->update(['status' => 'paid']);
        }

        if ($orderType === 'ml' && $orderId > 0) {
            DB::table('ml_orders')
                ->where('id', $orderId)
                ->where('user_id', $user->id)
                ->update(['status' => 'paid']);
        }

        if ($orderType === 'service' && $orderId > 0) {
            DB::table('service_orders')
                ->where('id', $orderId)
                ->where('user_id', $user->id)
                ->update(['status' => 'paid']);
        }

        if ($orderType === 'topup') {
            $balance = UserBalance::where('user_id', $user->id)->first();

            if (!$balance) {
                $balance = UserBalance::create([
                    'user_id' => $user->id,
                    'balance' => 0,
                    'updated_at' => now(),
                ]);
            }

            $balance->balance += $amount;
            $balance->updated_at = now();
            $balance->save();
        }

        return response()->json([
            'click_trans_id' => $clickTransId,
            'merchant_trans_id' => $merchantTransId,
            'merchant_confirm_id' => $clickTransId,
            'error' => 0,
            'error_note' => 'Success',
        ]);
    }

    private function parseMerchantTransId(string $merchantTransId): array
    {
        if (is_numeric($merchantTransId)) {
            return [
                'user_id' => (int) $merchantTransId,
                'order_type' => 'topup',
                'order_id' => 0,
            ];
        }

        $result = [
            'user_id' => 0,
            'order_type' => 'topup',
            'order_id' => 0,
        ];

        $parts = explode('|', $merchantTransId);

        foreach ($parts as $part) {
            [$key, $value] = array_pad(explode(':', $part, 2), 2, null);

            if ($key === 'u') {
                $result['user_id'] = (int) $value;
            }

            if ($key === 't') {
                $result['order_type'] = (string) $value;
            }

            if ($key === 'o') {
                $result['order_id'] = (int) $value;
            }
        }

        return $result;
    }
}
