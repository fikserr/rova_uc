<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PromoCode;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class PromoCodeController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/PromoCodes', [
            'codes' => PromoCode::orderByDesc('id')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'code'             => ['required', 'string', 'max:50', 'unique:promo_codes,code'],
            'discount_type'    => ['required', 'in:percent,fixed'],
            'discount_value'   => ['required', 'numeric', 'min:0'],
            'min_order_amount' => ['nullable', 'numeric', 'min:0'],
            'max_uses'         => ['nullable', 'integer', 'min:1'],
            'expires_at'       => ['nullable', 'date'],
        ]);

        PromoCode::create($data);

        return back();
    }

    public function update(Request $request, PromoCode $promoCode)
    {
        $data = $request->validate([
            'code'             => ['required', 'string', 'max:50', Rule::unique('promo_codes', 'code')->ignore($promoCode->id)],
            'discount_type'    => ['required', 'in:percent,fixed'],
            'discount_value'   => ['required', 'numeric', 'min:0'],
            'min_order_amount' => ['nullable', 'numeric', 'min:0'],
            'max_uses'         => ['nullable', 'integer', 'min:1'],
            'expires_at'       => ['nullable', 'date'],
        ]);

        $promoCode->update($data);

        return back();
    }

    public function destroy(PromoCode $promoCode)
    {
        $promoCode->delete();

        return back();
    }

    public function toggle(PromoCode $promoCode)
    {
        $promoCode->update(['is_active' => ! $promoCode->is_active]);

        return back();
    }
}
