<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Currency;
use App\Models\CurrencyRate;
use App\Models\Service;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ServiceController extends Controller
{
    public function index()
    {
        $rates = $this->latestRates();
        $services = Service::orderByDesc('id')->get()->map(function ($service) use ($rates) {
            $sellRate = $this->resolveRate($rates, $service->sell_currency ?? 'UZS');
            $costRate = $this->resolveRate($rates, $service->cost_currency ?? 'UZS');
            $service->profit_base = round(
                ((float) $service->sell_price * $sellRate) - ((float) $service->cost_price * $costRate),
                2
            );

            return $service;
        });

        return Inertia::render('Admin/Services', [
            'services' => $services,
            'currencies' => Currency::where('is_active', true)->orderBy('code')->get(['code', 'name']),
        ]);
    }

    public function userStars()
    {
        $userId = auth()->id();
        $lastTargetTelegramUsername = '';

        if ($userId) {
            $lastServiceOrder = DB::table('service_orders')
                ->where('user_id', $userId)
                ->orderByDesc('id')
                ->first(['target_telegram_id']);

            if ($lastServiceOrder?->target_telegram_id) {
                $lastTargetTelegramUsername = (string) $lastServiceOrder->target_telegram_id;
            }
        }

        $servicePromos = \App\Models\Promotion::active()
            ->where(fn ($q) => $q->where('applies_to', 'service')->orWhere('applies_to', 'all'))
            ->get(['title', 'description', 'discount_percent', 'applies_to', 'ends_at', 'banner_color']);

        $isReseller = auth()->user()?->role === 'reseller';

        return Inertia::render('User/UserTgStars', [
            'services' => Service::where('is_active', true)
                ->where('service_type', 'stars')
                ->where($isReseller ? 'visible_to_resellers' : 'visible_to_users', true)
                ->orderByDesc('id')->get(),
            'lastTargetTelegramUsername' => $lastTargetTelegramUsername,
            'promotions'                => $servicePromos,
        ]);
    }

    public function userPremium()
    {
        $userId = auth()->id();
        $lastTargetTelegramUsername = '';

        if ($userId) {
            $lastServiceOrder = DB::table('service_orders')
                ->where('user_id', $userId)
                ->orderByDesc('id')
                ->first(['target_telegram_id']);

            if ($lastServiceOrder?->target_telegram_id) {
                $lastTargetTelegramUsername = (string) $lastServiceOrder->target_telegram_id;
            }
        }

        $servicePromos = \App\Models\Promotion::active()
            ->where(fn ($q) => $q->where('applies_to', 'service')->orWhere('applies_to', 'all'))
            ->get(['title', 'description', 'discount_percent', 'applies_to', 'ends_at', 'banner_color']);

        $isReseller = auth()->user()?->role === 'reseller';

        return Inertia::render('User/UserTgPremium', [
            'services' => Service::where('is_active', true)
                ->where('service_type', 'premium')
                ->where($isReseller ? 'visible_to_resellers' : 'visible_to_users', true)
                ->orderByDesc('id')->get(),
            'lastTargetTelegramUsername' => $lastTargetTelegramUsername,
            'promotions'                => $servicePromos,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => 'required|string',
            'service_type' => 'required|in:stars,premium',
            'value' => 'required|integer',
            'sell_price' => 'required|numeric',
            'cost_price' => 'required|numeric',
            'cost_currency' => 'required|string',
        ]);

        Service::create([
            ...$data,
            'sell_currency' => 'UZS',
            'is_active' => true,
            'created_at' => now(),
        ]);

        return redirect()->back()->with('success', 'Service qo`shildi');
    }

    public function update(Request $request, Service $service)
    {
        $data = $request->validate([
            'title'                => 'required|string',
            'value'                => 'required|integer',
            'sell_price'           => 'required|numeric',
            'cost_price'           => 'required|numeric',
            'cost_currency'        => 'required|string',
            'is_active'            => 'boolean',
            'visible_to_users'     => 'boolean',
            'visible_to_resellers' => 'boolean',
        ]);

        $service->update($data);

        return redirect()->back()->with('success', 'Service yangilandi');
    }

    public function destroy(Service $service)
    {
        $service->delete();

        return redirect()->back()->with('success', 'Service o`chirildi');
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
