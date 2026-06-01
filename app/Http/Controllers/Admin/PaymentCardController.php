<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PaymentCard;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PaymentCardController extends Controller
{
    public function index()
    {
        $cards = PaymentCard::orderByDesc('id')->get();

        return Inertia::render('Admin/PaymentCards', [
            'cards' => $cards,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'card_number' => ['required', 'string', 'max:24'],
            'card_holder' => ['nullable', 'string', 'max:100'],
            'bank_name'   => ['nullable', 'string', 'max:60'],
            'is_active'   => ['boolean'],
        ]);

        PaymentCard::create($data);

        return back();
    }

    public function update(Request $request, PaymentCard $card)
    {
        $data = $request->validate([
            'card_number' => ['required', 'string', 'max:24'],
            'card_holder' => ['nullable', 'string', 'max:100'],
            'bank_name'   => ['nullable', 'string', 'max:60'],
            'is_active'   => ['boolean'],
        ]);

        $card->update($data);

        return back();
    }

    public function destroy(PaymentCard $card)
    {
        $card->delete();

        return back();
    }

    // Foydalanuvchilar uchun — faqat aktiv kartalar
    public function active()
    {
        $cards = PaymentCard::where('is_active', true)
            ->orderByDesc('id')
            ->get(['id', 'card_number', 'card_holder', 'bank_name']);

        return response()->json($cards);
    }
}
