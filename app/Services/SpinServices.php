<?php

namespace App\Services;

use App\Models\SpinSector;
use App\Models\UserSpin;
use App\Models\SpinLimit;
use App\Models\UserBalance;
use App\Models\SpinRule;
use App\Models\Payment;
use Carbon\Carbon;

class SpinService
{
    public function spin(int $userId)
    {
        /**
         * 1️⃣ User qancha pul tashlaganini hisoblaymiz
         */
        $totalPaid = Payment::where('user_id', $userId)
            ->where('status', 'paid')
            ->where('currency', 'UZS')
            ->sum('amount');

        /**
         * 2️⃣ Eng katta mos keladigan spin rule ni topamiz
         */
        $rule = SpinRule::where('is_active', true)
            ->where('min_total_deposit', '<=', $totalPaid)
            ->orderByDesc('min_total_deposit')
            ->first();

        if (!$rule) {
            throw new \Exception(
                "Spin qilish uchun balans yetarli emas"
            );
        }

        $allowedSpins = $rule->spins_count;

        /**
         * 3️⃣ User spin limitini tekshiramiz
         */
        $limit = SpinLimit::firstOrCreate(
            ['user_id' => $userId],
            ['spins_used' => 0, 'last_spin_at' => null]
        );

        if ($limit->spins_used >= $allowedSpins) {
            throw new \Exception(
                "Sizga berilgan spinlar tugagan"
            );
        }

        /**
         * 4️⃣ Spin sector tanlaymiz (probability bilan)
         */
        $sector = $this->selectSector();

        /**
         * 5️⃣ Reward berish
         */
        if ($sector->reward_type === 'balance' && $sector->reward_value > 0) {
            UserBalance::where('user_id', $userId)
                ->increment('balance', $sector->reward_value);
        }

        /**
         * 6️⃣ Spin tarixga yozamiz
         */
        UserSpin::create([
            'user_id'      => $userId,
            'sector_id'    => $sector->id,
            'reward_type'  => $sector->reward_type,
            'reward_value' => $sector->reward_value,
            'created_at'   => now(),
        ]);

        /**
         * 7️⃣ Limitni yangilaymiz
         */
        $limit->increment('spins_used');
        $limit->update([
            'last_spin_at' => Carbon::now(),
        ]);

        return [
            'sector'        => $sector,
            'spins_used'    => $limit->spins_used,
            'spins_allowed' => $allowedSpins,
        ];
    }

    /**
     * 🎯 Probability bo‘yicha sektor tanlash
     */
    protected function selectSector(): SpinSector
    {
        $sectors = SpinSector::where('is_active', true)->get();

        if ($sectors->isEmpty()) {
            throw new \Exception("Spin sektorlar mavjud emas");
        }

        $pool = [];

        foreach ($sectors as $sector) {
            for ($i = 0; $i < $sector->probability; $i++) {
                $pool[] = $sector;
            }
        }

        return $pool[array_rand($pool)];
    }
}
