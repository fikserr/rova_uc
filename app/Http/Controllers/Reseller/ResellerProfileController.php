<?php

namespace App\Http\Controllers\Reseller;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ResellerProfileController extends Controller
{
    public function index()
    {
        $user    = auth()->user();
        $balance = (float) DB::table('user_balances')
            ->where('user_id', $user->id)
            ->value('balance') ?? 0;

        $stats = DB::table('sekali_orders')
            ->where('user_id', $user->id)
            ->selectRaw("
                COUNT(*) as total_orders,
                SUM(CASE WHEN status IN ('completed','delivered','paid') THEN price_uzs ELSE 0 END) as total_spent,
                SUM(CASE WHEN status IN ('completed','delivered','paid') AND regular_price_uzs IS NOT NULL
                    THEN (regular_price_uzs - price_uzs) ELSE 0 END) as total_saved
            ")
            ->first();

        return Inertia::render('Reseller/Profile', [
            'user'    => [
                'id'         => $user->id,
                'username'   => $user->username ?? $user->name,
                'role'       => $user->role,
                'language'   => $user->language ?? 'uz',
                'created_at' => $user->created_at,
            ],
            'balance' => $balance,
            'stats'   => [
                'total_orders' => (int) ($stats->total_orders ?? 0),
                'total_spent'  => (float) ($stats->total_spent ?? 0),
                'total_saved'  => (float) ($stats->total_saved ?? 0),
            ],
        ]);
    }
}
