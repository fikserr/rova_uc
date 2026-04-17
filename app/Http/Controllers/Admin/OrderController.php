<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
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
            'description' => 'nullable|string|max:500',
        ]);

        if ($data['status'] === 'canceled' && trim((string) ($data['description'] ?? '')) === '') {
            return back()->with('error', 'Bekor qilish sababini kiriting');
        }

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

            $this->createUserNotification(
                (string) $data['order_type'],
                $order,
                (string) $newStatus,
                isset($data['description']) ? trim((string) $data['description']) : null
            );

            return ['ok' => true, 'message' => 'Order status yangilandi'];
        });

        if (!$result['ok']) {
            return back()->with('error', $result['message']);
        }

        return back()->with('success', $result['message']);
    }

    private function createUserNotification(string $orderType, object $order, string $status, ?string $description): void
    {
        if (!Schema::hasTable('user_notifications')) {
            return;
        }

        $title = '';
        $message = '';

        if ($status === 'delivered') {
            if ($orderType === 'uc') {
                $title = 'UC tushdi';
                $message = 'Buyurtmangiz bajarildi. UC hisobingizga tushirildi.';
            } elseif ($orderType === 'ml') {
                $title = 'Almaz tushdi';
                $message = 'Buyurtmangiz bajarildi. Almaz hisobingizga tushirildi.';
            } else {
                $serviceType = DB::table('services')->where('id', $order->service_id)->value('service_type');
                if ($serviceType === 'premium') {
                    $title = 'Premium berildi';
                    $message = 'Buyurtmangiz bajarildi. Premium aktiv qilindi.';
                } else {
                    $title = 'Stars tushdi';
                    $message = 'Buyurtmangiz bajarildi. Stars hisobingizga tushirildi.';
                }
            }
        } elseif ($status === 'canceled') {
            $title = 'Buyurtma bekor qilindi';
            $message = $description
                ? "Sabab: {$description}"
                : 'Buyurtmangiz admin tomonidan bekor qilindi.';
        } elseif ($status === 'paid') {
            $title = 'Buyurtma qabul qilindi';
            $message = "Buyurtmangiz to'lov holatiga o'tdi va ko'rib chiqilmoqda.";
        } else {
            $title = 'Buyurtma yangilandi';
            $message = "Buyurtma holati: {$status}";
        }

        DB::table('user_notifications')->insert([
            'user_id' => (int) $order->user_id,
            'source' => 'admin',
            'order_type' => $orderType,
            'order_id' => (int) $order->id,
            'status' => $status,
            'title' => $title,
            'message' => $message,
            'description' => $description,
            'is_read' => false,
            'created_at' => now(),
        ]);
    }

    public function ucOrdersData(): JsonResponse
    {
        $orders = DB::table('uc_orders as o')
            ->leftJoin('users as u', 'u.id', '=', 'o.user_id')
            ->leftJoin('uc_products as p', 'p.id', '=', 'o.product_id')
            ->leftJoin('pubg_accounts as a', 'a.id', '=', 'o.pubg_account_id')
            ->select([
                'o.id', 'o.status', 'o.sell_price', 'o.sell_currency',
                'o.cost_price', 'o.cost_currency', 'o.profit_base', 'o.created_at',
                'u.id as user_id', 'u.username',
                'p.title as product_title', 'p.uc_amount',
                'a.pubg_player_id', 'a.pubg_name',
            ])
            ->orderByDesc('o.id')
            ->get();

        return response()->json($orders);
    }

    public function mlOrdersData(): JsonResponse
    {
        $orders = DB::table('ml_orders as o')
            ->leftJoin('users as u', 'u.id', '=', 'o.user_id')
            ->leftJoin('ml_products as p', 'p.id', '=', 'o.product_id')
            ->leftJoin('ml_accounts as a', 'a.id', '=', 'o.ml_account_id')
            ->select([
                'o.id', 'o.status', 'o.sell_price', 'o.sell_currency',
                'o.cost_price', 'o.cost_currency', 'o.profit_base', 'o.created_at',
                'u.id as user_id', 'u.username',
                'p.title as product_title', 'p.diamonds',
                'a.ml_account_id', 'a.ml_server_id',
            ])
            ->orderByDesc('o.id')
            ->get();

        return response()->json($orders);
    }

    public function serviceOrdersData(): JsonResponse
    {
        $orders = DB::table('service_orders as o')
            ->leftJoin('users as u', 'u.id', '=', 'o.user_id')
            ->leftJoin('services as s', 's.id', '=', 'o.service_id')
            ->select([
                'o.id', 'o.status', 'o.sell_price', 'o.sell_currency',
                'o.cost_price', 'o.cost_currency', 'o.profit_base', 'o.created_at',
                'o.target_telegram_id',
                'u.id as user_id', 'u.username',
                's.title as service_title', 's.service_type', 's.value',
            ])
            ->orderByDesc('o.id')
            ->get();

        return response()->json($orders);
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
