<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\ReceiptService;
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
            'order_type' => 'required|in:uc,service',
            'order_id' => 'required|integer|min:1',
            'status' => 'required|in:pending,paid,delivered,canceled',
            'description' => 'nullable|string|max:500',
        ]);

        if ($data['status'] === 'canceled' && trim((string) ($data['description'] ?? '')) === '') {
            return back()->with('error', 'Bekor qilish sababini kiriting');
        }

        $table = match ($data['order_type']) {
            'uc'      => 'uc_orders',
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

            // After creating notification, send Telegram message
            try {
                $telegramService = app(\App\Services\TelegramNotificationService::class);
                $productName = '';
                if ($data['order_type'] === 'uc') {
                    $productName = DB::table('uc_products')->where('id', $order->product_id ?? 0)->value('title') ?? '';
                } elseif ($data['order_type'] === 'service') {
                    $productName = DB::table('services')->where('id', $order->service_id ?? 0)->value('title') ?? '';
                }
                $telegramService->notifyOrderStatus(
                    (int) $order->user_id,
                    $data['order_type'],
                    (int) $order->id,
                    $newStatus,
                    $productName,
                    $data['description'] ?? null
                );
            } catch (\Throwable) {}

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

    public function completeSekaliOrder(Request $request): JsonResponse
    {
        $data = $request->validate([
            'order_id' => 'required|integer|min:1',
        ]);

        $order = DB::table('sekali_orders')->where('id', $data['order_id'])->first();

        if (!$order) {
            return response()->json(['ok' => false, 'message' => 'Order topilmadi'], 404);
        }

        if (!in_array($order->status, ['pending', 'processing'], true)) {
            return response()->json(['ok' => false, 'message' => 'Bu order allaqachon yakunlangan'], 422);
        }

        DB::table('sekali_orders')
            ->where('id', $data['order_id'])
            ->update(['status' => 'completed']);

        // Chek yozish va mijozga Telegram xabari
        app(ReceiptService::class)->record('sekali', $order->ref_id);

        return response()->json(['ok' => true]);
    }

    public function ucOrdersData(): JsonResponse
    {
        return response()->json([
            'ucOrders'      => $this->fetchUcOrders(),
            'serviceOrders' => $this->fetchServiceOrders(),
        ]);
    }

    public function ucOrders(): Response
    {
        return Inertia::render('Admin/UcOrders', [
            'ucOrders'      => $this->fetchUcOrders(),
            'serviceOrders' => $this->fetchServiceOrders(),
            'workers'       => DB::table('users')->where('role', 'worker')->select('id', 'username')->get(),
        ]);
    }

    public function assignWorker(Request $request): JsonResponse
    {
        $data = $request->validate([
            'order_type' => 'required|in:uc,service',
            'order_id'   => 'required|integer|min:1',
            'worker_id'  => 'nullable|integer',
        ]);

        $table = $data['order_type'] === 'uc' ? 'uc_orders' : 'service_orders';

        DB::table($table)
            ->where('id', $data['order_id'])
            ->update(['assigned_worker_id' => $data['worker_id']]);

        return response()->json(['success' => true]);
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

    private function fetchUcOrders(): \Illuminate\Support\Collection
    {
        return DB::table('uc_orders as o')
            ->leftJoin('users as u', 'u.id', '=', 'o.user_id')
            ->leftJoin('uc_products as p', 'p.id', '=', 'o.product_id')
            ->leftJoin('pubg_accounts as a', 'a.id', '=', 'o.pubg_account_id')
            ->select([
                'o.id', 'o.status', 'o.sell_price', 'o.sell_currency',
                'o.profit_base', 'o.created_at', 'o.assigned_worker_id',
                'u.id as user_id', 'u.username',
                'p.title as product_title',
                'a.pubg_player_id', 'a.pubg_name',
            ])
            ->orderByDesc('o.id')
            ->get();
    }

    private function fetchServiceOrders(): \Illuminate\Support\Collection
    {
        return DB::table('service_orders as o')
            ->leftJoin('users as u', 'u.id', '=', 'o.user_id')
            ->leftJoin('services as s', 's.id', '=', 'o.service_id')
            ->select([
                'o.id', 'o.status', 'o.sell_price', 'o.sell_currency',
                'o.profit_base', 'o.created_at', 'o.target_telegram_id',
                'u.id as user_id', 'u.username',
                's.title as service_title', 's.service_type',
            ])
            ->orderByDesc('o.id')
            ->get();
    }

    private function fetchSekaliOrders(): \Illuminate\Support\Collection
    {
        return DB::table('sekali_orders as o')
            ->leftJoin('users as u', 'u.id', '=', 'o.user_id')
            ->leftJoin('sekali_products as p', 'p.id', '=', 'o.sekali_product_id')
            ->select([
                'o.id', 'o.ref_id', 'o.status', 'o.price_uzs', 'o.price_idr',
                'o.game_target', 'o.zone_id', 'o.sekali_invoice', 'o.notes',
                'o.created_at',
                'u.id as user_id', 'u.username',
                'p.game_name', 'p.name as product_name', 'p.category',
                'p.product_type', 'p.image_url',
            ])
            ->orderByDesc('o.id')
            ->get();
    }

    public function allOrders(): Response
    {
        return Inertia::render('Admin/AllOrders', [
            'ucOrders'      => $this->fetchUcOrders(),
            'serviceOrders' => $this->fetchServiceOrders(),
            'sekaliOrders'  => $this->fetchSekaliOrders(),
        ]);
    }

    public function allOrdersData(): JsonResponse
    {
        return response()->json([
            'ucOrders'      => $this->fetchUcOrders(),
            'serviceOrders' => $this->fetchServiceOrders(),
            'sekaliOrders'  => $this->fetchSekaliOrders(),
        ]);
    }

    public function exportCsv(Request $request): \Symfony\Component\HttpFoundation\StreamedResponse
    {
        $type = $request->query('type', 'uc'); // uc, service, sekali

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$type}_orders_" . now()->format('Y-m-d') . ".csv\"",
        ];

        return response()->stream(function () use ($type) {
            $handle = fopen('php://output', 'w');
            fprintf($handle, chr(0xEF).chr(0xBB).chr(0xBF)); // UTF-8 BOM

            if ($type === 'uc') {
                fputcsv($handle, ['ID', 'User', 'Mahsulot', 'PUBG ID', 'PUBG Nick', 'Narx', 'Valyuta', 'Foyda', 'Status', 'Sana']);
                $orders = $this->fetchUcOrders();
                foreach ($orders as $o) {
                    fputcsv($handle, [$o->id, $o->username, $o->product_title, $o->pubg_player_id, $o->pubg_name, $o->sell_price, $o->sell_currency, $o->profit_base, $o->status, $o->created_at]);
                }
            } elseif ($type === 'service') {
                fputcsv($handle, ['ID', 'User', 'Xizmat', 'Telegram ID', 'Narx', 'Valyuta', 'Foyda', 'Status', 'Sana']);
                $orders = $this->fetchServiceOrders();
                foreach ($orders as $o) {
                    fputcsv($handle, [$o->id, $o->username, $o->service_title, $o->target_telegram_id, $o->sell_price, $o->sell_currency, $o->profit_base, $o->status, $o->created_at]);
                }
            } elseif ($type === 'sekali') {
                fputcsv($handle, ['ID', 'User', 'Game', 'Mahsulot', 'Game Target', 'Zone', 'Narx UZS', 'Invoice', 'Status', 'Sana']);
                $orders = $this->fetchSekaliOrders();
                foreach ($orders as $o) {
                    fputcsv($handle, [$o->id, $o->username, $o->game_name, $o->product_name, $o->game_target, $o->zone_id, $o->price_uzs, $o->sekali_invoice, $o->status, $o->created_at]);
                }
            }

            fclose($handle);
        }, 200, $headers);
    }
}
