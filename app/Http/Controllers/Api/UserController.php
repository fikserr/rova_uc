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
        $users = User::with('balance')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'username' => $user->username,
                    'phone_number' => $user->phone_number,
                    'balance' => $user->balance?->balance ?? 0,
                    'role' => $user->role,
                     'created_at' => now()
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
            'telegram_id' => 'required|integer',
            'phone_number' => 'required|string'
        ]);

        DB::transaction(function () use ($request) {
            $user = User::findOrFail($request->telegram_id);

            $user->update([
                'phone_number' => $request->phone_number
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
