<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class AdminDashboardController extends Controller
{
    public function index(): Response
    {
        $from = now()->subDays(13)->startOfDay();
        $to = now()->endOfDay();

        $usersCount = (int) DB::table('users')->count();
        $activeUsers = (int) DB::table('sessions')
            ->whereNotNull('user_id')
            ->where('last_activity', '>=', now()->subMinutes(15)->timestamp)
            ->distinct('user_id')
            ->count('user_id');

        $byType = [
            $this->aggregateByTable('uc_orders', 'UC'),
            $this->aggregateByTable('ml_orders', 'ML'),
            $this->aggregateByTable('service_orders', 'Service'),
        ];

        $summary = [
            'users_count' => $usersCount,
            'active_users' => $activeUsers,
            'orders_count' => array_sum(array_column($byType, 'orders_count')),
            'paid_orders' => array_sum(array_column($byType, 'paid_orders')),
            'revenue_uzs' => round(array_sum(array_column($byType, 'revenue_uzs')), 2),
            'profit_uzs' => round(array_sum(array_column($byType, 'profit_uzs')), 2),
        ];

        $statuses = $this->statusDistribution();
        $trend = $this->dailyTrend($from, $to);
        $recentOrders = $this->recentOrders();

        return Inertia::render('Admin/Dashboard', [
            'summary' => $summary,
            'byType' => $byType,
            'statuses' => $statuses,
            'trend' => $trend,
            'recentOrders' => $recentOrders,
        ]);
    }

    private function aggregateByTable(string $table, string $label): array
    {
        $row = DB::table($table)
            ->selectRaw('COUNT(*) as orders_count')
            ->selectRaw("SUM(CASE WHEN status IN ('paid','delivered') THEN 1 ELSE 0 END) as paid_orders")
            ->selectRaw("SUM(CASE WHEN status IN ('paid','delivered') THEN sell_price ELSE 0 END) as revenue_uzs")
            ->selectRaw("SUM(CASE WHEN status IN ('paid','delivered') THEN profit_base ELSE 0 END) as profit_uzs")
            ->first();

        return [
            'key' => $table,
            'label' => $label,
            'orders_count' => (int) ($row->orders_count ?? 0),
            'paid_orders' => (int) ($row->paid_orders ?? 0),
            'revenue_uzs' => round((float) ($row->revenue_uzs ?? 0), 2),
            'profit_uzs' => round((float) ($row->profit_uzs ?? 0), 2),
        ];
    }

    private function statusDistribution(): array
    {
        $totals = collect(['pending' => 0, 'paid' => 0, 'delivered' => 0, 'canceled' => 0]);

        foreach (['uc_orders', 'ml_orders', 'service_orders'] as $table) {
            $rows = DB::table($table)
                ->select('status', DB::raw('COUNT(*) as count'))
                ->groupBy('status')
                ->get();

            foreach ($rows as $row) {
                $status = (string) $row->status;
                if ($totals->has($status)) {
                    $totals[$status] += (int) $row->count;
                }
            }
        }

        return $totals->map(fn ($count, $status) => [
            'status' => $status,
            'count' => $count,
        ])->values()->all();
    }

    private function dailyTrend(Carbon $from, Carbon $to): array
    {
        $days = [];
        $cursor = $from->copy();
        while ($cursor <= $to) {
            $key = $cursor->toDateString();
            $days[$key] = [
                'date' => $key,
                'orders' => 0,
                'revenue_uzs' => 0,
                'profit_uzs' => 0,
            ];
            $cursor->addDay();
        }

        foreach (['uc_orders', 'ml_orders', 'service_orders'] as $table) {
            $rows = DB::table($table)
                ->whereBetween('created_at', [$from, $to])
                ->selectRaw('DATE(created_at) as day')
                ->selectRaw('COUNT(*) as orders_count')
                ->selectRaw("SUM(CASE WHEN status IN ('paid','delivered') THEN sell_price ELSE 0 END) as revenue_uzs")
                ->selectRaw("SUM(CASE WHEN status IN ('paid','delivered') THEN profit_base ELSE 0 END) as profit_uzs")
                ->groupBy('day')
                ->orderBy('day')
                ->get();

            foreach ($rows as $row) {
                $day = (string) $row->day;
                if (!isset($days[$day])) {
                    continue;
                }
                $days[$day]['orders'] += (int) ($row->orders_count ?? 0);
                $days[$day]['revenue_uzs'] += (float) ($row->revenue_uzs ?? 0);
                $days[$day]['profit_uzs'] += (float) ($row->profit_uzs ?? 0);
            }
        }

        return array_values(array_map(function (array $item) {
            $item['revenue_uzs'] = round($item['revenue_uzs'], 2);
            $item['profit_uzs'] = round($item['profit_uzs'], 2);
            return $item;
        }, $days));
    }

    private function recentOrders(): array
    {
        $uc = DB::table('uc_orders')
            ->selectRaw("'UC' as type, id, user_id, status, sell_price, profit_base, created_at")
            ->orderByDesc('id')
            ->limit(5)
            ->get();
        $ml = DB::table('ml_orders')
            ->selectRaw("'ML' as type, id, user_id, status, sell_price, profit_base, created_at")
            ->orderByDesc('id')
            ->limit(5)
            ->get();
        $service = DB::table('service_orders')
            ->selectRaw("'SERVICE' as type, id, user_id, status, sell_price, profit_base, created_at")
            ->orderByDesc('id')
            ->limit(5)
            ->get();

        return $uc
            ->concat($ml)
            ->concat($service)
            ->sortByDesc('created_at')
            ->take(8)
            ->values()
            ->toArray();
    }
}
