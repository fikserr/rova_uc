<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class OrderReceiptController extends Controller
{
    public function index(Request $request): Response
    {
        $validated = $request->validate([
            'from'   => 'nullable|date',
            'to'     => 'nullable|date',
            'preset' => 'nullable|in:today,7d,30d,90d',
            'type'   => 'nullable|string',
        ]);

        [$from, $to, $preset] = $this->resolvePeriod($validated);

        $query = DB::table('order_receipts')
            ->whereBetween('order_receipts.created_at', [$from, $to]);

        if (!empty($validated['type'])) {
            $query->where('order_type', $validated['type']);
        }

        // Jami ko'rsatkichlar
        $summary = $query->selectRaw('
            COUNT(*) as total_count,
            SUM(sell_price_uzs)  as total_sell,
            SUM(cost_price_uzs)  as total_cost,
            SUM(profit_uzs)      as total_profit
        ')->first();

        // Tur bo'yicha taqsimlash
        $byType = (clone $query)->selectRaw('
            order_type,
            COUNT(*)             as count,
            SUM(sell_price_uzs)  as sell,
            SUM(cost_price_uzs)  as cost,
            SUM(profit_uzs)      as profit
        ')->groupBy('order_type')->get();

        // Kunlik dinamika (oxirgi 30 kun)
        $daily = DB::table('order_receipts')
            ->whereBetween('order_receipts.created_at', [$from, $to])
            ->selectRaw('DATE(created_at) as date, SUM(profit_uzs) as profit, SUM(sell_price_uzs) as sell')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Ro'yxat (sahifalangan)
        $receipts = (clone $query)
            ->select([
                'order_receipts.*',
                DB::raw("COALESCE(users.username, CONCAT('User #', order_receipts.user_id)) as username"),
            ])
            ->leftJoin('users', 'users.id', '=', 'order_receipts.user_id')
            ->orderByDesc('order_receipts.created_at')
            ->paginate(50)
            ->appends($request->query());

        return Inertia::render('Admin/OrderReceipts', [
            'filters' => [
                'from'   => $from->toDateString(),
                'to'     => $to->toDateString(),
                'preset' => $preset,
                'type'   => $validated['type'] ?? '',
            ],
            'summary'  => $summary,
            'byType'   => $byType,
            'daily'    => $daily,
            'receipts' => $receipts,
        ]);
    }

    private function resolvePeriod(array $v): array
    {
        $preset = $v['preset'] ?? '30d';

        if (!empty($v['from']) && !empty($v['to'])) {
            return [
                Carbon::parse($v['from'])->startOfDay(),
                Carbon::parse($v['to'])->endOfDay(),
                $preset,
            ];
        }

        $to = now()->endOfDay();
        $from = match ($preset) {
            'today' => now()->startOfDay(),
            '7d'    => now()->subDays(7)->startOfDay(),
            '90d'   => now()->subDays(90)->startOfDay(),
            default => now()->subDays(30)->startOfDay(),
        };

        return [$from, $to, $preset];
    }
}
