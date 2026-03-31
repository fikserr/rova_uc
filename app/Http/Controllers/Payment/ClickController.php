<?php

namespace App\Http\Controllers\Payment;

use App\Models\UserBalance;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\User;

class ClickController extends Controller
{
    public function prepare(Request $request)
    {
        return response()->json([
            "click_trans_id" => $request->click_trans_id,
            "merchant_trans_id" => $request->merchant_trans_id,
            "merchant_prepare_id" => $request->merchant_trans_id,
            "error" => 0,
            "error_note" => "Success"
        ]);
    }

    public function complete(Request $request)
    {
        $telegramId = $request->merchant_trans_id;
        $amount = $request->amount;
        $clickTransId = $request->click_trans_id;

        $user = User::find($telegramId);

        if (!$user) {
            return response()->json([
                "error" => -5,
                "error_note" => "User not found"
            ]);
        }

        // double payment tekshiruv
        $payment = Payment::where('click_trans_id', $clickTransId)->first();

        if ($payment) {
            return response()->json([
                "error" => 0,
                "error_note" => "Already paid"
            ]);
        }

        // payment yozish
        Payment::create([
            'user_id' => $user->id,
            'amount' => $amount,
            'currency' => 'UZS',
            'click_trans_id' => $clickTransId,
            'status' => 'paid',
            'created_at' => now()
        ]);

        // balans olish
        $balance = UserBalance::where('user_id', $user->id)->first();

        if (!$balance) {
            $balance = UserBalance::create([
                'user_id' => $user->id,
                'balance' => 0,
                'updated_at' => now()
            ]);
        }

        // balans qo‘shish
        $balance->balance += $amount;
        $balance->updated_at = now();
        $balance->save();

        return response()->json([
            "click_trans_id" => $clickTransId,
            "merchant_trans_id" => $telegramId,
            "merchant_confirm_id" => $clickTransId,
            "error" => 0,
            "error_note" => "Success"
        ]);
    }
}