<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class PurchaseController extends Controller
{
    public function index(): Response
    {
        $userId = auth()->id();

        $ucOrders = DB::table('uc_orders as o')
            ->leftJoin('uc_products as p', 'p.id', '=', 'o.product_id')
            ->leftJoin('pubg_accounts as a', 'a.id', '=', 'o.pubg_account_id')
            ->where('o.user_id', $userId)
            ->select([
                'o.id',
                'o.status',
                'o.sell_price',
                'o.sell_currency',
                'o.created_at',
                'p.title as product_title',
                'p.uc_amount',
                'a.pubg_player_id',
                'a.pubg_name',
            ])
            ->get()
            ->map(function ($o) {
                return [
                    'id' => 'UC-' . $o->id,
                    'order_type' => 'uc',
                    'title' => $o->product_title ?: 'PUBG MOBILE UC',
                    'amount' => ($o->uc_amount ?? 0) . ' UC',
                    'price' => (float) ($o->sell_price ?? 0),
                    'currency' => $o->sell_currency ?: 'UZS',
                    'status' => $o->status ?: 'pending',
                    'target' => $o->pubg_player_id ?: ($o->pubg_name ?: '-'),
                    'created_at' => $o->created_at,
                ];
            });

        $mlOrders = DB::table('ml_orders as o')
            ->leftJoin('ml_products as p', 'p.id', '=', 'o.product_id')
            ->leftJoin('ml_accounts as a', 'a.id', '=', 'o.ml_account_id')
            ->where('o.user_id', $userId)
            ->select([
                'o.id',
                'o.status',
                'o.sell_price',
                'o.sell_currency',
                'o.created_at',
                'p.title as product_title',
                'p.diamonds',
                'a.ml_account_id',
                'a.ml_server_id',
            ])
            ->get()
            ->map(function ($o) {
                $account = $o->ml_account_id ?: '-';
                $server = $o->ml_server_id ? ('/' . $o->ml_server_id) : '';

                return [
                    'id' => 'ML-' . $o->id,
                    'order_type' => 'ml',
                    'title' => $o->product_title ?: 'Mobile Legends Diamond',
                    'amount' => ($o->diamonds ?? 0) . ' Diamond',
                    'price' => (float) ($o->sell_price ?? 0),
                    'currency' => $o->sell_currency ?: 'UZS',
                    'status' => $o->status ?: 'pending',
                    'target' => $account . $server,
                    'created_at' => $o->created_at,
                ];
            });

        $serviceOrders = DB::table('service_orders as o')
            ->leftJoin('services as s', 's.id', '=', 'o.service_id')
            ->where('o.user_id', $userId)
            ->select([
                'o.id',
                'o.status',
                'o.sell_price',
                'o.sell_currency',
                'o.created_at',
                'o.target_telegram_id',
                's.title as service_title',
                's.service_type',
                's.value',
            ])
            ->get()
            ->map(function ($o) {
                $amount = '-';
                if ($o->service_type === 'stars') {
                    $amount = ($o->value ?? 0) . ' Stars';
                } elseif ($o->service_type === 'premium') {
                    $amount = ($o->value ?? 0) . ' oylik premium';
                }

                return [
                    'id' => 'SV-' . $o->id,
                    'order_type' => 'service',
                    'title' => $o->service_title ?: 'Telegram Service',
                    'amount' => $amount,
                    'price' => (float) ($o->sell_price ?? 0),
                    'currency' => $o->sell_currency ?: 'UZS',
                    'status' => $o->status ?: 'pending',
                    'target' => $o->target_telegram_id ?: '-',
                    'created_at' => $o->created_at,
                ];
            });

        $purchases = $ucOrders
            ->concat($mlOrders)
            ->concat($serviceOrders)
            ->sortByDesc('created_at')
            ->values();

        $completedCount = $purchases
            ->whereIn('status', ['paid', 'delivered'])
            ->count();

        $totalSpent = $purchases
            ->whereIn('status', ['paid', 'delivered'])
            ->sum('price');

        return Inertia::render('User/UserPurchases', [
            'purchases' => $purchases,
            'stats' => [
                'total' => $purchases->count(),
                'completed' => $completedCount,
                'total_spent' => $totalSpent,
                'currency' => 'UZS',
            ],
        ]);
    }
}

