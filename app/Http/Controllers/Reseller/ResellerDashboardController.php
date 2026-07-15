<?php

namespace App\Http\Controllers\Reseller;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ResellerDashboardController extends Controller
{
    public function index()
    {
        $userId = auth()->id();

        $balance = (float) DB::table('user_balances')
            ->where('user_id', $userId)
            ->value('balance') ?? 0;

        // Sekali orders stats
        $sekaliStats = DB::table('sekali_orders')
            ->where('user_id', $userId)
            ->selectRaw("
                COUNT(*) as total,
                SUM(CASE WHEN status IN ('completed','delivered','paid') THEN price_uzs ELSE 0 END) as total_spent,
                SUM(CASE WHEN status IN ('completed','delivered','paid') AND DATE(created_at) = CURDATE() THEN price_uzs ELSE 0 END) as today_spent,
                SUM(CASE WHEN status IN ('completed','delivered','paid') AND created_at >= DATE_FORMAT(NOW(),'%Y-%m-01') THEN price_uzs ELSE 0 END) as month_spent,
                SUM(CASE WHEN status = 'processing' THEN 1 ELSE 0 END) as pending_count,
                SUM(CASE WHEN status IN ('completed','delivered','paid') THEN 1 ELSE 0 END) as completed_count,
                SUM(CASE WHEN status IN ('completed','delivered','paid') AND regular_price_uzs IS NOT NULL
                    THEN (regular_price_uzs - price_uzs) ELSE 0 END) as total_saved
            ")
            ->first();

        // Recent orders (last 20)
        $orders = DB::table('sekali_orders as o')
            ->leftJoin('sekali_products as p', 'p.id', '=', 'o.sekali_product_id')
            ->where('o.user_id', $userId)
            ->orderByDesc('o.created_at')
            ->limit(20)
            ->get([
                'o.id', 'o.ref_id', 'o.status', 'o.price_uzs', 'o.regular_price_uzs', 'o.game_target',
                'o.zone_id', 'o.created_at', 'o.sekali_invoice',
                'p.game_name', 'p.name as variant_name', 'p.image_url',
            ])
            ->map(fn($o) => [
                'id'               => 'SK-' . $o->id,
                'ref_id'           => $o->ref_id,
                'game_name'        => $o->game_name ?? 'Game',
                'variant_name'     => $o->variant_name ?? '-',
                'image_url'        => $o->image_url,
                'status'           => $o->status,
                'price_uzs'        => (float) $o->price_uzs,
                'regular_price_uzs'=> $o->regular_price_uzs ? (float) $o->regular_price_uzs : null,
                'saved_uzs'        => $o->regular_price_uzs ? (float) $o->regular_price_uzs - (float) $o->price_uzs : null,
                'game_target'      => $o->game_target,
                'zone_id'          => $o->zone_id,
                'invoice'          => $o->sekali_invoice,
                'created_at'       => $o->created_at,
            ]);

        // Available products with reseller prices
        $products = DB::table('sekali_products')
            ->where('is_active', true)
            ->whereNotNull('reseller_price_uzs')
            ->orderBy('game_name')
            ->orderBy('reseller_price_uzs')
            ->get(['id', 'game_name', 'name', 'price_uzs', 'reseller_price_uzs', 'image_url', 'product_type'])
            ->map(fn($p) => [
                'id'                 => $p->id,
                'game_name'          => $p->game_name,
                'name'               => $p->name,
                'price_uzs'          => (float) $p->price_uzs,
                'reseller_price_uzs' => (float) $p->reseller_price_uzs,
                'discount_percent'   => round((1 - $p->reseller_price_uzs / $p->price_uzs) * 100, 1),
                'image_url'          => $p->image_url,
                'product_type'       => $p->product_type,
            ]);

        return Inertia::render('Reseller/Dashboard', [
            'balance' => $balance,
            'stats'   => [
                'total_orders'    => (int) ($sekaliStats->total ?? 0),
                'completed'       => (int) ($sekaliStats->completed_count ?? 0),
                'pending'         => (int) ($sekaliStats->pending_count ?? 0),
                'total_spent'     => (float) ($sekaliStats->total_spent ?? 0),
                'today_spent'     => (float) ($sekaliStats->today_spent ?? 0),
                'month_spent'     => (float) ($sekaliStats->month_spent ?? 0),
                'total_saved'     => (float) ($sekaliStats->total_saved ?? 0),
            ],
            'orders'   => $orders,
            'products' => $products->groupBy('game_name'),
        ]);
    }
}
