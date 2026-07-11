<?php declare(strict_types=1);

/**
 * CardXabarBot + HUMOcardbot → To'lov guruhiga avtomatik forward
 * Ishga tushirish: php bot/card_forwarder.php
 */

require __DIR__ . '/../vendor/autoload.php';

use danog\MadelineProto\SimpleEventHandler;
use danog\MadelineProto\EventHandler\Attributes\Handler;
use danog\MadelineProto\EventHandler\Message\PrivateMessage;
use danog\MadelineProto\Settings\AppInfo;

// .env yuklash
Dotenv\Dotenv::createImmutable(__DIR__ . '/../')->safeLoad();

$apiId   = (int)    ($_ENV['TG_API_ID']        ?? 0);
$apiHash = (string) ($_ENV['TG_API_HASH']      ?? '');
$groupId = (int)    ($_ENV['CARD_BOT_CHAT_ID'] ?? 0);

$watchedBots = array_map(
    fn($b) => strtolower(trim($b)),
    explode(',', $_ENV['CARD_BOT_USERNAMES'] ?? 'HUMOcardbot,CardXabarBot')
);

if (!$apiId || !$apiHash) die("❌ TG_API_ID va TG_API_HASH kerak (.env)\n");
if (!$groupId)             die("❌ CARD_BOT_CHAT_ID kerak (.env)\n");

// Global o'zgaruvchilar — constructor override mumkin emasligi sababli
define('CARD_GROUP_ID',    $groupId);
define('CARD_WATCHED_BOTS', implode(',', $watchedBots));

// ─── Event Handler ────────────────────────────────────────────

class CardForwarder extends SimpleEventHandler
{
    #[Handler]
    public function onPrivateMessage(PrivateMessage $message): void
    {
        $sender   = strtolower($message->sender->username ?? '');
        $fullText = $message->message ?? '';
        $preview  = substr($fullText, 0, 80);

        $bots = explode(',', CARD_WATCHED_BOTS);

        // HUMOcardbot username bo'sh keladi — mazmun bo'yicha aniqlash
        $isKnownBot   = $sender !== '' && in_array($sender, $bots, true);
        $isPaymentMsg = (bool) preg_match(
            '/(?:UZS|so\'?m|sum).*(?:to.ldirish|kirim|kredit|\+\s*[\d])|(?:to.ldirish|kirim|kredit|\+\s*[\d]).*(?:UZS|so\'?m|sum)/isu',
            $fullText
        );

        if (!$isKnownBot && !$isPaymentMsg) {
            return;
        }

        try {
            $message->forward(CARD_GROUP_ID);
            echo '[' . date('H:i:s') . "] @{$sender} → guruh: {$preview}\n";
        } catch (\Throwable $e) {
            echo '[' . date('H:i:s') . "] Xato: " . $e->getMessage() . "\n";
        }
    }

    public function getReportPeers(): array
    {
        return [];
    }
}

// ─── Ishga tushirish ──────────────────────────────────────────

$botsDisplay = '@' . implode(', @', explode(',', CARD_WATCHED_BOTS));
echo "Karta bot forwarder ishga tushmoqda...\n";
echo "  Kuzatiladigan: {$botsDisplay}\n";
echo "  To'lov guruhi: {$groupId}\n\n";

$settings = (new AppInfo)
    ->setApiId($apiId)
    ->setApiHash($apiHash);

CardForwarder::startAndLoop(
    __DIR__ . '/card_forwarder.madeline',
    $settings
);
