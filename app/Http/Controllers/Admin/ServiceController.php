<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Service;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ServiceController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Services', [
            'services' => Service::orderBy('id', 'desc')->get()
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

        return Inertia::render('User/UserTgStars', [
            'services' => Service::orderBy('id', 'desc')->get(),
            'lastTargetTelegramUsername' => $lastTargetTelegramUsername,
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

        return Inertia::render('User/UserTgPremium', [
            'services' => Service::orderBy('id', 'desc')->get(),
            'lastTargetTelegramUsername' => $lastTargetTelegramUsername,
        ]);
    }
    public function store(Request $request)
    {
        $data = $request->validate([
            'title'         => 'required|string',
            'service_type'  => 'required|in:stars,premium',
            'value'         => 'required|integer',
            'sell_price'    => 'required|numeric',
            'cost_price'    => 'required|numeric',
            'cost_currency' => 'required|string',
        ]);

        Service::create([
            ...$data,
            'sell_currency' => 'UZS',
            'is_active'     => true,
            'created_at'    => now(),
        ]);

        return redirect()->back()->with('success', 'Service qo‘shildi');
    }

    public function update(Request $request, Service $service)
    {
        $data = $request->validate([
            'title'         => 'required|string',
            'value'         => 'required|integer',
            'sell_price'    => 'required|numeric',
            'cost_price'    => 'required|numeric',
            'cost_currency' => 'required|string',
            'is_active'     => 'boolean',
        ]);

        $service->update($data);

        return redirect()->back()->with('success', 'Service yangilandi');
    }

    public function destroy(Service $service)
    {
        $service->delete();

        return redirect()->back()->with('success', 'Service o‘chirildi');
    }
}
