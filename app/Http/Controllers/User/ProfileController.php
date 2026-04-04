<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    public function show(): Response
    {
        $user = auth()->user();
        $userId = $user?->id;

        $referralsCount = 0;
        $referralsEarned = 0.0;
        $totalPurchases = 0;
        $totalSpent = 0.0;

        if ($userId) {
            $referralsCount = (int) DB::table('referrals')
                ->where('referrer_id', $userId)
                ->count();

            $referralsEarned = (float) DB::table('referrals')
                ->where('referrer_id', $userId)
                ->sum('reward_amount');

            $paidStatuses = ['paid', 'delivered'];

            $ucPaidCount = (int) DB::table('uc_orders')
                ->where('user_id', $userId)
                ->whereIn('status', $paidStatuses)
                ->count();
            $mlPaidCount = (int) DB::table('ml_orders')
                ->where('user_id', $userId)
                ->whereIn('status', $paidStatuses)
                ->count();
            $servicePaidCount = (int) DB::table('service_orders')
                ->where('user_id', $userId)
                ->whereIn('status', $paidStatuses)
                ->count();

            $ucPaidSpent = (float) DB::table('uc_orders')
                ->where('user_id', $userId)
                ->whereIn('status', $paidStatuses)
                ->sum('sell_price');
            $mlPaidSpent = (float) DB::table('ml_orders')
                ->where('user_id', $userId)
                ->whereIn('status', $paidStatuses)
                ->sum('sell_price');
            $servicePaidSpent = (float) DB::table('service_orders')
                ->where('user_id', $userId)
                ->whereIn('status', $paidStatuses)
                ->sum('sell_price');

            $totalPurchases = $ucPaidCount + $mlPaidCount + $servicePaidCount;
            $totalSpent = $ucPaidSpent + $mlPaidSpent + $servicePaidSpent;
        }

        $botUsername = $this->resolveBotUsername();
        $referralLink = 'https://t.me/' . $botUsername . '?start=ref_' . $userId;

        return Inertia::render('User/UserProfile', [
            'referral' => [
                'link' => $referralLink,
                'friends_count' => $referralsCount,
                'earned_amount' => $referralsEarned,
                'currency' => 'UZS',
            ],
            'stats' => [
                'total_purchases' => $totalPurchases,
                'total_spent' => $totalSpent,
                'currency' => 'UZS',
            ],
        ]);
    }

    private function resolveBotUsername(): string
    {
        $fromEnv = trim((string) env('TELEGRAM_BOT_USERNAME', ''));
        if ($fromEnv !== '') {
            return ltrim($fromEnv, '@');
        }

        $returnUrl = trim((string) env('TELEGRAM_MINIAPP_RETURN_URL', ''));
        if ($returnUrl !== '') {
            if (preg_match('#https?://t\.me/([^/?#]+)/?#i', $returnUrl, $m)) {
                return ltrim((string) $m[1], '@');
            }
        }

        return 'yourbot';
    }
}
