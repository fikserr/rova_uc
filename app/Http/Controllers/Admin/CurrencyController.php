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
        $this->ensureUzsBaseCurrency();

        return Inertia::render('Admin/Currencies', [
            'currencies' => Currency::with(['rates' => function ($q) {
                $q->latest()->limit(1);
            }])->get(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'code' => 'required|string|max:5|unique:currencies,code',
            'name' => 'required|string',
            'symbol' => 'nullable|string',
        ]);

        $code = strtoupper(trim((string) $data['code']));

        Currency::create([
            'code' => $code,
            'name' => $data['name'],
            'symbol' => $data['symbol'] ?? null,
            'is_base' => $code === 'UZS',
            'is_active' => true,
        ]);

        if ($code === 'UZS') {
            Currency::where('code', '!=', 'UZS')->update(['is_base' => false]);
            CurrencyRate::firstOrCreate(
                ['currency_code' => 'UZS', 'rate_to_base' => 1],
                ['created_at' => now()]
            );
        }

        return redirect()->back()->with('success', 'Valyuta qo\'shildi');
    }

    public function update(Request $request, Currency $currency)
    {
        $data = $request->validate([
            'name' => 'required|string',
            'symbol' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $currency->update([
            'name' => $data['name'],
            'symbol' => $data['symbol'] ?? null,
            'is_active' => (bool) ($data['is_active'] ?? $currency->is_active),
            'is_base' => $currency->code === 'UZS',
        ]);

        return redirect()->back()->with('success', 'Valyuta yangilandi');
    }

    public function storeRate(Request $request)
    {
        $data = $request->validate([
            'currency_code' => 'required|exists:currencies,code',
            'rate_to_base' => 'required|numeric|min:0',
        ]);

        $currencyCode = strtoupper((string) $data['currency_code']);
        $rateToBase = (float) $data['rate_to_base'];

        if ($currencyCode === 'UZS') {
            $rateToBase = 1.0;
        }

        CurrencyRate::create([
            'currency_code' => $currencyCode,
            'rate_to_base' => $rateToBase,
            'created_at' => now(),
        ]);

        return redirect()->back()->with('success', 'Kurs yangilandi');
    }

    private function ensureUzsBaseCurrency(): void
    {
        Currency::updateOrCreate(
            ['code' => 'UZS'],
            [
                'name' => 'Uzbekistan Som',
                'symbol' => 'so\'m',
                'is_base' => true,
                'is_active' => true,
            ]
        );

        Currency::where('code', '!=', 'UZS')->update(['is_base' => false]);

        CurrencyRate::firstOrCreate(
            ['currency_code' => 'UZS', 'rate_to_base' => 1],
            ['created_at' => now()]
        );
    }
}
