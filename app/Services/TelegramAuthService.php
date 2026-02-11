<?php

namespace App\Services;

class TelegramAuthService
{
    /**
     * Maximum age of initData in seconds (replay attack protection).
     * Default 24 hours so auth is more likely to succeed across timezones.
     */
    public static function getMaxAuthAge(): int
    {
        return (int) (config('services.telegram.init_data_max_age', 86400));
    }

    /**
     * Verify Telegram WebApp initData: hash signature and auth_date (replay protection).
     * Returns parsed data array without hash, or null if invalid.
     * When APP_DEBUG=true, returns ['_fail' => reason] instead of null for debugging.
     *
     * @see https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
     */
    public static function verify(string $initData): array|null
    {
        if ($initData === '') {
            return config('app.debug') ? ['_fail' => 'empty_init_data'] : null;
        }

        parse_str($initData, $data);

        if (empty($data['hash']) || ! is_string($data['hash'])) {
            return config('app.debug') ? ['_fail' => 'missing_hash'] : null;
        }

        $hash = $data['hash'];

        if (! self::validateAuthDate($data)) {
            return config('app.debug') ? ['_fail' => 'auth_date_invalid', '_auth_date' => $data['auth_date'] ?? null] : null;
        }

        // Data-check-string: decoded key=value, sorted by key (Telegram docs: alphabetical order)
        unset($data['hash']);
        ksort($data);
        $dataCheckString = implode("\n", array_map(
            fn ($k, $v) => $k.'='.$v,
            array_keys($data),
            array_values($data)
        ));

        $botToken = trim((string) config('services.telegram.bot_token'));
        if ($botToken === '') {
            return config('app.debug') ? ['_fail' => 'no_bot_token'] : null;
        }

        // Telegram: secret_key = HMAC_SHA256. Try both common parameter orders.
        $secretKeyA = hash_hmac('sha256', 'WebAppData', $botToken, true);
        $secretKeyB = hash_hmac('sha256', $botToken, 'WebAppData', true);

        $calculatedHashA = hash_hmac('sha256', $dataCheckString, $secretKeyA);
        $calculatedHashB = hash_hmac('sha256', $dataCheckString, $secretKeyB);

        if (! hash_equals($calculatedHashA, $hash) && ! hash_equals($calculatedHashB, $hash)) {
            return config('app.debug') ? ['_fail' => 'hash_mismatch'] : null;
        }

        return $data;
    }

    /**
     * Replay protection: initData must contain auth_date and not be too old.
     * Allows 10 min in future for clock skew.
     */
    private static function validateAuthDate(array $data): bool
    {
        if (empty($data['auth_date']) || ! is_numeric($data['auth_date'])) {
            return false;
        }

        $authDate = (int) $data['auth_date'];
        $now = time();
        $maxAge = self::getMaxAuthAge();

        return $authDate >= ($now - $maxAge) && $authDate <= ($now + 600);
    }
}
