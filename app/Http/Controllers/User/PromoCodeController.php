<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\PromoCode;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PromoCodeController extends Controller
{
    public function check(Request $request): JsonResponse
    {
        $data = $request->validate([
            'code'       => 'required|string|max:50',
            'amount'     => 'required|numeric|min:0',
        ]);

        $promo = PromoCode::where('code', strtoupper(trim($data['code'])))->first();

        if (!$promo || !$promo->isValid((float) $data['amount'])) {
            return response()->json([
                'valid' => false,
                'error' => "Promo kod yaroqsiz, muddati o'tgan yoki foydalanish limiti tugagan",
            ]);
        }

        $discount = $promo->discount_type === 'percent'
            ? (float) $data['amount'] * $promo->discount_value / 100
            : $promo->discount_value;

        $discount     = min($discount, (float) $data['amount']);
        $finalAmount  = (float) $data['amount'] - $discount;

        $label = $promo->discount_type === 'percent'
            ? "{$promo->discount_value}% chegirma"
            : number_format($promo->discount_value, 0, '.', ' ') . " UZS chegirma";

        return response()->json([
            'valid'        => true,
            'discount'     => round($discount, 2),
            'final_amount' => round($finalAmount, 2),
            'label'        => $label,
        ]);
    }
}
