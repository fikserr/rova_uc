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
        [$purchases, $completedCount, $totalSpent] = $this->buildPurchases(auth()->id());

        return Inertia::render('User/UserPurchases', [
            'purchases' => $purchases->values(),
            'stats' => [
                'total'       => $purchases->count(),
                'completed'   => $completedCount,
                'total_spent' => $totalSpent,
                'currency'    => 'UZS',
            ],
        ]);
    }

    public function data(): \Illuminate\Http\JsonResponse
    {
        [$purchases, $completedCount, $totalSpent] = $this->buildPurchases(auth()->id());

        return response()->json([
            'purchases' => $purchases->values(),
            'stats' => [
                'total'       => $purchases->count(),
                'completed'   => $completedCount,
                'total_spent' => $totalSpent,
                'currency'    => 'UZS',
            ],
        ]);
    }

    private function buildPurchases(string $userId): array
    {
        $ucOrders = DB::table('uc_orders as o')
            ->leftJoin('uc_products as p', 'p.id', '=', 'o.product_id')
            ->leftJoin('pubg_accounts as a', 'a.id', '=', 'o.pubg_account_id')
            ->where('o.user_id', $userId)
            ->select(['o.id','o.status','o.sell_price','o.sell_currency','o.created_at','p.title as product_title','p.uc_amount','a.pubg_player_id','a.pubg_name'])
            ->get()
            ->map(fn($o) => [
                'id'         => 'UC-' . $o->id,
                'order_type' => 'uc',
                'title'      => $o->product_title ?: 'PUBG MOBILE UC',
                'amount'     => ($o->uc_amount ?? 0) . ' UC',
                'price'      => (float) ($o->sell_price ?? 0),
                'currency'   => $o->sell_currency ?: 'UZS',
                'status'     => $o->status ?: 'pending',
                'target'     => $o->pubg_player_id ?: ($o->pubg_name ?: '-'),
                'created_at' => $o->created_at,
            ]);

        $mlOrders = DB::table('ml_orders as o')
            ->leftJoin('ml_products as p', 'p.id', '=', 'o.product_id')
            ->leftJoin('ml_accounts as a', 'a.id', '=', 'o.ml_account_id')
            ->where('o.user_id', $userId)
            ->select(['o.id','o.status','o.sell_price','o.sell_currency','o.created_at','p.title as product_title','p.diamonds','a.ml_account_id','a.ml_server_id'])
            ->get()
            ->map(fn($o) => [
                'id'         => 'ML-' . $o->id,
                'order_type' => 'ml',
                'title'      => $o->product_title ?: 'Mobile Legends Diamond',
                'amount'     => ($o->diamonds ?? 0) . ' Diamond',
                'price'      => (float) ($o->sell_price ?? 0),
                'currency'   => $o->sell_currency ?: 'UZS',
                'status'     => $o->status ?: 'pending',
                'target'     => ($o->ml_account_id ?: '-') . ($o->ml_server_id ? '/' . $o->ml_server_id : ''),
                'created_at' => $o->created_at,
            ]);

        $serviceOrders = DB::table('service_orders as o')
            ->leftJoin('services as s', 's.id', '=', 'o.service_id')
            ->where('o.user_id', $userId)
            ->select(['o.id','o.status','o.sell_price','o.sell_currency','o.created_at','o.target_telegram_id','s.title as service_title','s.service_type','s.value'])
            ->get()
            ->map(fn($o) => [
                'id'         => 'SV-' . $o->id,
                'order_type' => 'service',
                'title'      => $o->service_title ?: 'Telegram Service',
                'amount'     => $o->service_type === 'stars' ? ($o->value ?? 0) . ' Stars' : ($o->value ?? 0) . ' oylik premium',
                'price'      => (float) ($o->sell_price ?? 0),
                'currency'   => $o->sell_currency ?: 'UZS',
                'status'     => $o->status ?: 'pending',
                'target'     => $o->target_telegram_id ?: '-',
                'created_at' => $o->created_at,
            ]);

        $sekaliOrders = DB::table('sekali_orders as o')
            ->leftJoin('sekali_products as p', 'p.id', '=', 'o.sekali_product_id')
            ->where('o.user_id', $userId)
            ->select(['o.id','o.ref_id','o.status','o.price_uzs','o.created_at','o.game_target','o.sekali_invoice','p.game_name','p.name as variant_name'])
            ->get()
            ->map(fn($o) => [
                'id'         => 'SK-' . $o->id,
                'order_type' => 'sekali',
                'title'      => $o->game_name ?: 'Game',
                'amount'     => $o->variant_name ?: '-',
                'price'      => (float) ($o->price_uzs ?? 0),
                'currency'   => 'UZS',
                'status'     => $o->status ?: 'pending',
                'target'     => $o->game_target ?: '-',
                'invoice'    => $o->sekali_invoice ?: null,
                'created_at' => $o->created_at,
            ]);

        $purchases = $ucOrders->concat($mlOrders)->concat($serviceOrders)->concat($sekaliOrders)
            ->sortByDesc('created_at')
            ->values();

        $completedCount = $purchases->whereIn('status', ['paid', 'delivered', 'completed'])->count();
        $totalSpent     = $purchases->whereIn('status', ['paid', 'delivered', 'completed'])->sum('price');

        return [$purchases, $completedCount, $totalSpent];
    }
}

