<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Currency;
use App\Models\CurrencyRate;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CurrencyController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Currencies', [
            'currencies' => Currency::with(['rates' => function ($q) {
                $q->latest()->limit(1);
            }])->get()
        ]);
    }

    // 🆕 Valyuta qo‘shish
    public function store(Request $request)
    {
        $data = $request->validate([
            'code'     => 'required|string|max:5|unique:currencies,code',
            'name'     => 'required|string',
            'symbol'   => 'nullable|string',
            'is_base'  => 'boolean',
        ]);

        // Agar yangi base bo‘lsa → eski base’ni o‘chiramiz
        if (!empty($data['is_base'])) {
            Currency::where('is_base', true)->update(['is_base' => false]);
        }

        Currency::create([
            ...$data,
            'is_active' => true,
        ]);

        return redirect()->back()->with('success', 'Valyuta qo‘shildi');
    }

    // ✏️ Valyutani tahrirlash
    public function update(Request $request, Currency $currency)
    {
        $data = $request->validate([
            'name'     => 'required|string',
            'symbol'   => 'nullable|string',
            'is_base'  => 'boolean',
            'is_active'=> 'boolean',
        ]);

        if (!empty($data['is_base'])) {
            Currency::where('is_base', true)
                ->where('code', '!=', $currency->code)
                ->update(['is_base' => false]);
        }

        $currency->update($data);

        return redirect()->back()->with('success', 'Valyuta yangilandi');
    }

    // 💱 Kurs qo‘shish
    public function storeRate(Request $request)
    {
        $data = $request->validate([
            'currency_code' => 'required|exists:currencies,code',
            'rate_to_base'  => 'required|numeric|min:0',
        ]);

        CurrencyRate::create([
            'currency_code' => $data['currency_code'],
            'rate_to_base'  => $data['rate_to_base'],
            'created_at'    => now(),
        ]);

        return redirect()->back()->with('success', 'Kurs yangilandi');
    }
}
