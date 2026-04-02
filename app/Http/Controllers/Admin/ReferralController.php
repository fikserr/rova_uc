<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ReferralController extends Controller
{
    public function index(): Response
    {
        $setting = DB::table('referral_settings')->orderByDesc('id')->first();

        if (!$setting) {
            $id = DB::table('referral_settings')->insertGetId([
                'reward_amount' => 0,
                'reward_currency' => 'UZS',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $setting = DB::table('referral_settings')->where('id', $id)->first();
        }

        $totalReferrals = (int) DB::table('referrals')->count();
        $totalRewarded = (float) DB::table('referrals')->sum('reward_amount');

        return Inertia::render('Admin/ReferralSettings', [
            'setting' => $setting,
            'stats' => [
                'total_referrals' => $totalReferrals,
                'total_rewarded' => $totalRewarded,
            ],
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'reward_amount' => 'required|numeric|min:0',
            'is_active' => 'required|boolean',
        ]);

        $setting = DB::table('referral_settings')->orderByDesc('id')->first();

        if (!$setting) {
            DB::table('referral_settings')->insert([
                'reward_amount' => $data['reward_amount'],
                'reward_currency' => 'UZS',
                'is_active' => $data['is_active'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        } else {
            DB::table('referral_settings')
                ->where('id', $setting->id)
                ->update([
                    'reward_amount' => $data['reward_amount'],
                    'is_active' => $data['is_active'],
                    'updated_at' => now(),
                ]);
        }

        return back()->with('success', 'Referral sozlamalari yangilandi');
    }
}

