<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Currency;
use App\Models\CurrencyRate;
use App\Models\UcBundle;
use App\Models\UcProduct;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class UcProductController extends Controller
{
    public function index()
    {
        $rates = $this->latestRates();
        $products = UcProduct::orderByDesc('id')->get()->map(function ($product) use ($rates) {
            $sellRate = $this->resolveRate($rates, $product->sell_currency ?? 'UZS');
            $costRate = $this->resolveRate($rates, $product->cost_currency ?? 'UZS');
            $product->profit_base = round(
                ((float) $product->sell_price * $sellRate) - ((float) $product->cost_price * $costRate),
                2
            );

            return $product;
        });

        return Inertia::render('Admin/UcProducts', [
            'products' => $products,
            'currencies' => Currency::where('is_active', true)->orderBy('code')->get(['code', 'name']),
        ]);
    }

    public function userIndex()
    {
        $userId = auth()->id();
        $lastPubgAccount = null;

        if ($userId) {
            $lastPubgAccount = DB::table('pubg_accounts')
                ->where('user_id', $userId)
                ->orderByDesc('id')
                ->first(['pubg_player_id', 'pubg_name']);
        }

        $isReseller = auth()->user()?->role === 'reseller';

        $bundles = UcBundle::where('is_active', true)
            ->where($isReseller ? 'visible_to_resellers' : 'visible_to_users', true)
            ->orderBy('sort_order')
            ->orderByDesc('id')
            ->get()
            ->map(function ($b) {
                $b->image_url = $b->image_path
                    ? Storage::disk('public')->url($b->image_path)
                    : null;
                return $b;
            });

        return Inertia::render('User/UcShop', [
            'products'        => UcProduct::where('is_active', true)
                                    ->where($isReseller ? 'visible_to_resellers' : 'visible_to_users', true)
                                    ->orderByDesc('id')->get(),
            'bundles'         => $bundles,
            'lastPubgAccount' => $lastPubgAccount,
            'promotions'      => \App\Models\Promotion::active()
                ->where(fn ($q) => $q->where('applies_to', 'uc')->orWhere('applies_to', 'all'))
                ->get(['title', 'description', 'discount_percent', 'applies_to', 'ends_at', 'banner_color']),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title'          => 'required|string',
            'uc_amount'      => 'required|integer',
            'sell_price'     => 'required|numeric',
            'reseller_price' => 'nullable|numeric',
            'cost_price'     => 'required|numeric',
            'cost_currency'  => 'required|string',
        ]);

        UcProduct::create([
            ...$data,
            'sell_currency' => 'UZS',
            'is_active' => true,
            'created_at' => now(),
        ]);

        return redirect()->back()->with('success', 'UC mahsulot qo`shildi');
    }

    public function update(Request $request, UcProduct $product)
    {
        $data = $request->validate([
            'title'                => 'required|string',
            'uc_amount'            => 'required|integer',
            'sell_price'           => 'required|numeric',
            'reseller_price'       => 'nullable|numeric',
            'cost_price'           => 'required|numeric',
            'cost_currency'        => 'required|string',
            'is_active'            => 'boolean',
            'visible_to_users'     => 'boolean',
            'visible_to_resellers' => 'boolean',
        ]);

        $product->update($data);

        return redirect()->back()->with('success', 'UC mahsulot yangilandi');
    }

    public function destroy(UcProduct $product)
    {
        $product->delete();

        return redirect()->back()->with('success', 'UC mahsulot o`chirildi');
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
