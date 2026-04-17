<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class AdminOrderNotificationService
{
    /**
     * Yangi order kelganda barcha adminlarga Telegram orqali notification yuborish.
     * Admin user_id = Telegram chat_id (users.id = telegram_id).
     */
    public static function notifyNewOrder(string $orderType, int $orderId): void
    {
        if (!Schema::hasTable('user_notifications')) {
            return;
        }

        $adminIds = DB::table('users')
            ->where('role', 'admin')
            ->pluck('id')
            ->all();

        if (empty($adminIds)) {
            return;
        }

        $details = self::fetchOrderDetails($orderType, $orderId);
        $title   = self::buildTitle($orderType, $orderId);
        $message = self::buildMessage($orderType, $details);

        $now = now();
        $rows = array_map(fn ($adminId) => [
            'user_id'     => (int) $adminId,
            'source'      => 'admin',
            'order_type'  => $orderType,
            'order_id'    => $orderId,
            'status'      => 'paid',
            'title'       => $title,
            'message'     => $message,
            'description' => null,
            'is_read'     => false,
            'created_at'  => $now,
        ], $adminIds);

        DB::table('user_notifications')->insert($rows);
    }

    private static function fetchOrderDetails(string $orderType, int $orderId): ?object
    {
        return match ($orderType) {
            'uc' => DB::table('uc_orders as o')
                ->leftJoin('users as u', 'u.id', '=', 'o.user_id')
                ->leftJoin('uc_products as p', 'p.id', '=', 'o.product_id')
                ->leftJoin('pubg_accounts as a', 'a.id', '=', 'o.pubg_account_id')
                ->where('o.id', $orderId)
                ->select([
                    'o.sell_price',
                    'o.sell_currency',
                    'u.username',
                    'p.title as product_title',
                    'a.pubg_player_id',
                ])
                ->first(),

            'ml' => DB::table('ml_orders as o')
                ->leftJoin('users as u', 'u.id', '=', 'o.user_id')
                ->leftJoin('ml_products as p', 'p.id', '=', 'o.product_id')
                ->leftJoin('ml_accounts as a', 'a.id', '=', 'o.ml_account_id')
                ->where('o.id', $orderId)
                ->select([
                    'o.sell_price',
                    'o.sell_currency',
                    'u.username',
                    'p.title as product_title',
                    'a.ml_account_id',
                    'a.ml_server_id',
                ])
                ->first(),

            'service' => DB::table('service_orders as o')
                ->leftJoin('users as u', 'u.id', '=', 'o.user_id')
                ->leftJoin('services as s', 's.id', '=', 'o.service_id')
                ->where('o.id', $orderId)
                ->select([
                    'o.sell_price',
                    'o.sell_currency',
                    'o.target_telegram_id',
                    'u.username',
                    's.title as product_title',
                ])
                ->first(),

            default => null,
        };
    }

    private static function buildTitle(string $orderType, int $orderId): string
    {
        $label = match ($orderType) {
            'uc'      => 'UC',
            'ml'      => 'ML Diamond',
            'service' => 'Service',
            default   => strtoupper($orderType),
        };

        return "Yangi buyurtma: {$label} #{$orderId}";
    }

    private static function buildMessage(string $orderType, ?object $d): string
    {
        if (!$d) {
            return 'Yangi buyurtma keldi.';
        }

        $username = $d->username ? '@' . $d->username : "Noma'lum";
        $amount   = number_format((float) ($d->sell_price ?? 0), 0, '.', ' ')
                    . ' ' . ($d->sell_currency ?? 'UZS');
        $product  = $d->product_title ?? '-';

        $extra = match ($orderType) {
            'uc'      => 'PUBG ID: ' . ($d->pubg_player_id ?? '-'),
            'ml'      => 'ML ID: ' . ($d->ml_account_id ?? '-') . ' | Server: ' . ($d->ml_server_id ?? '-'),
            'service' => 'TG: @' . ($d->target_telegram_id ?? '-'),
            default   => '',
        };

        return "User: {$username}\nMahsulot: {$product}\nNarx: {$amount}"
               . ($extra !== '' ? "\n{$extra}" : '');
    }
}
