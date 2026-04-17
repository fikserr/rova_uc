<?php

// app/Http/Controllers/Api/UserController.php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\UserBalance;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index()
    {
        $activeSince = now()->subMinutes(15)->timestamp;
        $activeUserIds = DB::table('sessions')
            ->whereNotNull('user_id')
            ->where('last_activity', '>=', $activeSince)
            ->distinct()
            ->pluck('user_id')
            ->map(fn ($id) => (string) $id)
            ->flip();

        $ucOrderStats = DB::table('uc_orders')
            ->selectRaw('user_id, COUNT(*) as orders_count, SUM(CASE WHEN status IN (?, ?) THEN sell_price ELSE 0 END) as total_spent', ['paid', 'delivered'])
            ->groupBy('user_id');

        $mlOrderStats = DB::table('ml_orders')
            ->selectRaw('user_id, COUNT(*) as orders_count, SUM(CASE WHEN status IN (?, ?) THEN sell_price ELSE 0 END) as total_spent', ['paid', 'delivered'])
            ->groupBy('user_id');

        $serviceOrderStats = DB::table('service_orders')
            ->selectRaw('user_id, COUNT(*) as orders_count, SUM(CASE WHEN status IN (?, ?) THEN sell_price ELSE 0 END) as total_spent', ['paid', 'delivered'])
            ->groupBy('user_id');

        $orderStatsByUser = DB::query()
            ->fromSub(
                $ucOrderStats->unionAll($mlOrderStats)->unionAll($serviceOrderStats),
                'order_stats'
            )
            ->selectRaw('user_id, SUM(orders_count) as total_orders, SUM(total_spent) as total_spent')
            ->groupBy('user_id')
            ->get()
            ->keyBy('user_id');

        $users = User::with('balance')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($user) use ($orderStatsByUser, $activeUserIds) {
                $stats = $orderStatsByUser->get($user->id);

                return [
                    'id' => $user->id,
                    'username' => $user->username,
                    'phone_number' => $user->phone_number,
                    'isActive' => isset($activeUserIds[(string) $user->id]),
                    'balance' => $user->balance?->balance ?? 0,
                    'totalOrders' => (int) ($stats->total_orders ?? 0),
                    'totalSpent' => (float) ($stats->total_spent ?? 0),
                    'role' => $user->role,
                    'created_at' => $user->created_at,
                ];
            });

        return Inertia::render('Admin/Users', [
            'users' => $users
        ]);
    }
    // /start bosilganda
    public function start(Request $request)
    {
        $request->validate([
            'telegram_id' => 'required|integer',
            'username' => 'nullable|string',
            'referrer_id' => 'nullable|integer',
        ]);

        // User yaratish yoki topish
        $user = User::firstOrCreate(
            ['id' => $request->telegram_id],
            [
                'username' => $request->username,
                'role' => 'user',
                'created_at' => now()
            ]
        );

        // Wallet yaratish
        UserBalance::firstOrCreate(
            ['user_id' => $user->id],
            ['balance' => 0, 'updated_at' => now()]
        );

        // Save pending referral relation for new users.
        $referrerId = (int) ($request->referrer_id ?? 0);
        if ($user->wasRecentlyCreated && $referrerId > 0 && $referrerId !== (int) $user->id) {
            $referrerExists = User::where('id', $referrerId)->exists();

            if ($referrerExists) {
                DB::table('referrals')->updateOrInsert(
                    ['referred_user_id' => $user->id],
                    [
                        'referrer_id' => $referrerId,
                        'reward_amount' => 0,
                        'reward_currency' => 'UZS',
                        'rewarded_at' => null,
                        'created_at' => now(),
                    ]
                );
            }
        }

        return response()->json([
            'status' => 'ok',
            'need_phone' => empty($user->phone_number)
        ]);
    }

    // Telefon raqam saqlash
    public function savePhone(Request $request)
    {
        $request->validate([
            'telegram_id'  => 'required|integer',
            'phone_number' => 'required|string|max:20',
        ]);

        DB::transaction(function () use ($request) {
            $user = User::findOrFail($request->telegram_id);

            // Prevent the same phone being registered by multiple accounts (referral fraud)
            $phoneExists = DB::table('users')
                ->where('phone_number', $request->phone_number)
                ->where('id', '!=', $user->id)
                ->exists();

            if ($phoneExists) {
                return; // Silently ignore duplicate phones — don't reward referral
            }

            // Skip if phone already set
            if ($user->phone_number) {
                return;
            }

            $user->update([
                'phone_number' => $request->phone_number,
            ]);

            $referral = DB::table('referrals')
                ->where('referred_user_id', $user->id)
                ->whereNull('rewarded_at')
                ->lockForUpdate()
                ->first();

            if (!$referral) {
                return;
            }

            $setting = DB::table('referral_settings')
                ->orderByDesc('id')
                ->first();

            if (!$setting || !$setting->is_active || (float) $setting->reward_amount <= 0) {
                return;
            }

            $rewardAmount = (float) $setting->reward_amount;
            $referrerId = (int) $referral->referrer_id;

            $balanceRow = DB::table('user_balances')
                ->where('user_id', $referrerId)
                ->lockForUpdate()
                ->first();

            $currentBalance = (float) ($balanceRow?->balance ?? 0);
            $newBalance = $currentBalance + $rewardAmount;

            if ($balanceRow) {
                DB::table('user_balances')
                    ->where('user_id', $referrerId)
                    ->update([
                        'balance' => $newBalance,
                        'updated_at' => now(),
                    ]);
            } else {
                DB::table('user_balances')->insert([
                    'user_id' => $referrerId,
                    'balance' => $newBalance,
                    'updated_at' => now(),
                ]);
            }

            DB::table('referrals')
                ->where('id', $referral->id)
                ->update([
                    'reward_amount' => $rewardAmount,
                    'reward_currency' => 'UZS',
                    'rewarded_at' => now(),
                ]);

            DB::table('payments')->insert([
                'user_id' => $referrerId,
                'click_trans_id' => 'REFERRAL-' . $referral->id . '-' . now()->timestamp . '-' . random_int(1000, 9999),
                'amount' => $rewardAmount,
                'currency' => 'UZS',
                'provider' => 'referral',
                'status' => 'paid',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        });

        return response()->json([
            'status' => 'saved'
        ]);
    }
}
