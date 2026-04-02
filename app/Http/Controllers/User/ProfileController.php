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

        if ($userId) {
            $referralsCount = (int) DB::table('referrals')
                ->where('referrer_id', $userId)
                ->count();

            $referralsEarned = (float) DB::table('referrals')
                ->where('referrer_id', $userId)
                ->sum('reward_amount');
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
