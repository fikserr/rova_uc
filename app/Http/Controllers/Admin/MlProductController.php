<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CurrencyRate;
use App\Models\MlProduct;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class MlProductController extends Controller
{
    public function index()
    {
        $rates = $this->latestRates();
        $products = MlProduct::orderByDesc('id')->get()->map(function ($product) use ($rates) {
            $sellRate = $this->resolveRate($rates, $product->sell_currency ?? 'UZS');
            $costRate = $this->resolveRate($rates, $product->cost_currency ?? 'UZS');
            $product->profit_base = round(
                ((float) $product->sell_price * $sellRate) - ((float) $product->cost_price * $costRate),
                2
            );

            return $product;
        });

        return Inertia::render('Admin/MlProducts', [
            'products' => $products,
        ]);
    }

    public function userIndex()
    {
        $userId = auth()->id();
        $lastMlAccount = null;

        if ($userId) {
            $lastMlAccount = DB::table('ml_accounts')
                ->where('user_id', $userId)
                ->orderByDesc('id')
                ->first(['ml_account_id', 'ml_server_id']);
        }

        return Inertia::render('User/Mlegends', [
            'products' => MlProduct::orderByDesc('id')->get(),
            'lastMlAccount' => $lastMlAccount,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => 'required|string',
            'diamonds' => 'required|integer',
            'sell_price' => 'required|numeric',
            'cost_price' => 'required|numeric',
            'cost_currency' => 'required|string',
        ]);

        MlProduct::create([
            ...$data,
            'sell_currency' => 'UZS',
            'is_active' => true,
            'created_at' => now(),
        ]);

        return back()->with('success', 'ML product qo`shildi');
    }

    public function update(Request $request, MlProduct $product)
    {
        $data = $request->validate([
            'title' => 'required|string',
            'diamonds' => 'required|integer',
            'sell_price' => 'required|numeric',
            'cost_price' => 'required|numeric',
            'cost_currency' => 'required|string',
            'is_active' => 'boolean',
        ]);

        $product->update($data);

        return back()->with('success', 'ML product yangilandi');
    }

    public function destroy(MlProduct $product)
    {
        $product->delete();

        return back()->with('success', 'ML product o`chirildi');
    }

    private function latestRates(): array
    {
        $rates = CurrencyRate::query()
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->get(['currency_code', 'rate_to_base'])
            ->unique('currency_code')
            ->mapWithKeys(fn ($rate) => [
                strtoupper(trim((string) $rate->currency_code)) => (float) $rate->rate_to_base,
            ])
            ->toArray();

        if (!isset($rates['UZS'])) {
            $rates['UZS'] = 1.0;
        }

        return $rates;
    }

    private function resolveRate(array $rates, ?string $currencyCode): float
    {
        $code = strtoupper(trim((string) ($currencyCode ?: 'UZS')));
        if ($code === 'UZS') {
            return 1.0;
        }

        return (float) ($rates[$code] ?? 0);
    }
}
