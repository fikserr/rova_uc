<?php

namespace App\Http\Controllers\Payment;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class PaymentController extends Controller
{
    public function create(Request $request)
    {
        $telegramId = $request->telegram_id;
        $amount = $request->amount;

        $params = [
            'service_id' => env('CLICK_SERVICE_ID'),
            'merchant_id' => env('CLICK_MERCHANT_ID'),
            'amount' => $amount,
            'transaction_param' => $telegramId,
            'return_url' => url('/payment/success'),
        ];

        $paymentUrl = "https://my.click.uz/services/pay?" . http_build_query($params);

        return response()->json([
            'payment_url' => $paymentUrl
        ]);
    }
}