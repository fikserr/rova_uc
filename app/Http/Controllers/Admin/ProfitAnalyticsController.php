<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ProfitAnalyticsController extends Controller
{
    public function index(Request $request): Response
    {
        $validated = $request->validate([
            'from' => 'nullable|date',
            'to' => 'nullable|date',
            'preset' => 'nullable|in:today,7d,30d,90d',
        ]);

        [$from, $to, $preset] = $this->resolvePeriod($validated);

        $byType = [
            $this->aggregateForTable('uc_orders', 'UC Orders', $from, $to),
            $this->aggregateForTable('ml_orders', 'ML Orders', $from, $to),
            $this->aggregateForTable('service_orders', 'Service Orders', $from, $to),
        ];

        $summary = [
            'orders_count' => array_sum(array_column($byType, 'orders_count')),
            'paid_orders' => array_sum(array_column($byType, 'paid_orders')),
            'revenue_uzs' => round(array_sum(array_column($byType, 'revenue_uzs')), 2),
            'cost_uzs' => round(array_sum(array_column($byType, 'cost_uzs')), 2),
            'profit_uzs' => round(array_sum(array_column($byType, 'profit_uzs')), 2),
        ];

        return Inertia::render('Admin/ProfitAnalytics', [
            'filters' => [
                'from' => $from->toDateString(),
                'to' => $to->toDateString(),
                'preset' => $preset,
            ],
            'summary' => $summary,
            'byType' => $byType,
        ]);
    }

    private function resolvePeriod(array $validated): array
    {
        $preset = $validated['preset'] ?? '30d';

        if (!empty($validated['from']) && !empty($validated['to'])) {
            $from = Carbon::parse($validated['from'])->startOfDay();
            $to = Carbon::parse($validated['to'])->endOfDay();
            return [$from, $to, $preset];
        }

        $to = now()->endOfDay();
        $from = match ($preset) {
            'today' => now()->startOfDay(),
            '7d' => now()->subDays(6)->startOfDay(),
            '90d' => now()->subDays(89)->startOfDay(),
            default => now()->subDays(29)->startOfDay(),
        };

        return [$from, $to, $preset];
    }

    private function aggregateForTable(string $table, string $label, Carbon $from, Carbon $to): array
    {
        $row = DB::table($table)
            ->whereBetween('created_at', [$from, $to])
            ->selectRaw('COUNT(*) as orders_count')
            ->selectRaw("SUM(CASE WHEN status IN ('paid','delivered') THEN 1 ELSE 0 END) as paid_orders")
            ->selectRaw("SUM(CASE WHEN status IN ('paid','delivered') THEN sell_price ELSE 0 END) as revenue_uzs")
            ->selectRaw("SUM(CASE WHEN status IN ('paid','delivered') THEN (sell_price - profit_base) ELSE 0 END) as cost_uzs")
            ->selectRaw("SUM(CASE WHEN status IN ('paid','delivered') THEN profit_base ELSE 0 END) as profit_uzs")
            ->first();

        return [
            'key' => $table,
            'label' => $label,
            'orders_count' => (int) ($row->orders_count ?? 0),
            'paid_orders' => (int) ($row->paid_orders ?? 0),
            'revenue_uzs' => round((float) ($row->revenue_uzs ?? 0), 2),
            'cost_uzs' => round((float) ($row->cost_uzs ?? 0), 2),
            'profit_uzs' => round((float) ($row->profit_uzs ?? 0), 2),
        ];
    }
}
