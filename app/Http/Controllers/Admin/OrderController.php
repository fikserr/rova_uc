<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function updateStatus(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'order_type' => 'required|in:uc,ml,service',
            'order_id' => 'required|integer|min:1',
            'status' => 'required|in:pending,paid,delivered,canceled',
        ]);

        $table = match ($data['order_type']) {
            'uc' => 'uc_orders',
            'ml' => 'ml_orders',
            'service' => 'service_orders',
        };

        $result = DB::transaction(function () use ($table, $data) {
            $order = DB::table($table)
                ->where('id', $data['order_id'])
                ->lockForUpdate()
                ->first();

            if (!$order) {
                return ['ok' => false, 'message' => 'Order topilmadi'];
            }

            $oldStatus = (string) $order->status;
            $newStatus = $data['status'];

            if ($oldStatus === $newStatus) {
                return ['ok' => true, 'message' => 'Status o\'zgarmadi'];
            }

            DB::table($table)
                ->where('id', $data['order_id'])
                ->update(['status' => $newStatus]);

            // If admin cancels an already paid/delivered order, return funds to internal balance.
            if ($newStatus === 'canceled' && in_array($oldStatus, ['paid', 'delivered'], true)) {
                $amount = (float) ($order->sell_price ?? 0);
                $userId = (int) $order->user_id;
                $refundKeyPrefix = 'REFUND-' . $data['order_type'] . '-' . $data['order_id'] . '-';

                if ($amount > 0 && $userId > 0) {
                    $alreadyRefunded = DB::table('payments')
                        ->where('user_id', $userId)
                        ->where('click_trans_id', 'like', $refundKeyPrefix . '%')
                        ->exists();

                    if ($alreadyRefunded) {
                        return ['ok' => true, 'message' => 'Order bekor qilingan (refund oldin berilgan)'];
                    }

                    $balanceRow = DB::table('user_balances')
                        ->where('user_id', $userId)
                        ->lockForUpdate()
                        ->first();

                    $currentBalance = (float) ($balanceRow?->balance ?? 0);
                    $newBalance = $currentBalance + $amount;

                    if ($balanceRow) {
                        DB::table('user_balances')
                            ->where('user_id', $userId)
                            ->update([
                                'balance' => $newBalance,
                                'updated_at' => now(),
                            ]);
                    } else {
                        DB::table('user_balances')->insert([
                            'user_id' => $userId,
                            'balance' => $newBalance,
                            'updated_at' => now(),
                        ]);
                    }

                    DB::table('payments')->insert([
                        'user_id' => $userId,
                        'click_trans_id' => $refundKeyPrefix . now()->timestamp . '-' . random_int(1000, 9999),
                        'amount' => $amount,
                        'currency' => $order->sell_currency ?? 'UZS',
                        'provider' => 'refund',
                        'status' => 'paid',
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }

            return ['ok' => true, 'message' => 'Order status yangilandi'];
        });

        if (!$result['ok']) {
            return back()->with('error', $result['message']);
        }

        return back()->with('success', $result['message']);
    }

    public function ucOrders(): Response
    {
        $orders = DB::table('uc_orders as o')
            ->leftJoin('users as u', 'u.id', '=', 'o.user_id')
            ->leftJoin('uc_products as p', 'p.id', '=', 'o.product_id')
            ->leftJoin('pubg_accounts as a', 'a.id', '=', 'o.pubg_account_id')
            ->select([
                'o.id',
                'o.status',
                'o.sell_price',
                'o.sell_currency',
                'o.cost_price',
                'o.cost_currency',
                'o.profit_base',
                'o.created_at',
                'u.id as user_id',
                'u.username',
                'p.title as product_title',
                'p.uc_amount',
                'a.pubg_player_id',
                'a.pubg_name',
            ])
            ->orderByDesc('o.id')
            ->get();

        return Inertia::render('Admin/UcOrders', [
            'orders' => $orders,
        ]);
    }

    public function mlOrders(): Response
    {
        $orders = DB::table('ml_orders as o')
            ->leftJoin('users as u', 'u.id', '=', 'o.user_id')
            ->leftJoin('ml_products as p', 'p.id', '=', 'o.product_id')
            ->leftJoin('ml_accounts as a', 'a.id', '=', 'o.ml_account_id')
            ->select([
                'o.id',
                'o.status',
                'o.sell_price',
                'o.sell_currency',
                'o.cost_price',
                'o.cost_currency',
                'o.profit_base',
                'o.created_at',
                'u.id as user_id',
                'u.username',
                'p.title as product_title',
                'p.diamonds',
                'a.ml_account_id',
                'a.ml_server_id',
            ])
            ->orderByDesc('o.id')
            ->get();

        return Inertia::render('Admin/MlOrders', [
            'orders' => $orders,
        ]);
    }

    public function serviceOrders(): Response
    {
        $orders = DB::table('service_orders as o')
            ->leftJoin('users as u', 'u.id', '=', 'o.user_id')
            ->leftJoin('services as s', 's.id', '=', 'o.service_id')
            ->select([
                'o.id',
                'o.status',
                'o.sell_price',
                'o.sell_currency',
                'o.cost_price',
                'o.cost_currency',
                'o.profit_base',
                'o.created_at',
                'o.target_telegram_id',
                'u.id as user_id',
                'u.username',
                's.title as service_title',
                's.service_type',
                's.value',
            ])
            ->orderByDesc('o.id')
            ->get();

        return Inertia::render('Admin/ServiceOrders', [
            'orders' => $orders,
        ]);
    }
}
