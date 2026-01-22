<?php

class TelegramAuthService
{
    public static function verify(string $initData): ?array
    {
        parse_str($initData, $data);

        $hash = $data['hash'];
        unset($data['hash']);

        ksort($data);

        $dataCheckString = collect($data)
            ->map(fn ($v, $k) => "$k=$v")
            ->join("\n");

        $secretKey = hash('sha256', config('telegram.bot_token'), true);
        $checkHash = hash_hmac('sha256', $dataCheckString, $secretKey);

        return hash_equals($checkHash, $hash) ? $data : null;
    }
}
