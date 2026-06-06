<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use OpenAI;

class OpenAiService
{
    private \OpenAI\Client $client;
    private string $model;

    public function __construct()
    {
        $this->client = OpenAI::client((string) config('services.openai.api_key'));
        $this->model  = (string) config('services.openai.model', 'gpt-4o-mini');
    }

    /**
     * Oddiy chat so'rovi — javob matnini qaytaradi.
     */
    public function chat(string $message, string $systemPrompt = ''): string
    {
        try {
            $messages = [];

            if ($systemPrompt !== '') {
                $messages[] = ['role' => 'system', 'content' => $systemPrompt];
            }

            $messages[] = ['role' => 'user', 'content' => $message];

            $response = $this->client->chat()->create([
                'model'    => $this->model,
                'messages' => $messages,
            ]);

            return trim($response->choices[0]->message->content ?? '');
        } catch (\Throwable $e) {
            Log::error('OpenAI chat error', ['error' => $e->getMessage()]);
            return '';
        }
    }

    /**
     * Mahsulot uchun sarlavha va tavsif yozadi (admin panel).
     */
    public function generateProductDescription(string $type, int $amount, float $price): array
    {
        $typeLabel = match ($type) {
            'uc'      => 'PUBG Mobile UC',
            'ml'      => 'Mobile Legends Almaz',
            'stars'   => 'Telegram Stars',
            'premium' => 'Telegram Premium',
            default   => $type,
        };

        $prompt = "Quyidagi mahsulot uchun qisqa sarlavha va tavsif yoz (o'zbek tilida):\n"
            . "Tur: {$typeLabel}\n"
            . "Miqdor: {$amount}\n"
            . "Narx: " . number_format($price, 0, '.', ' ') . " so'm\n\n"
            . "JSON formatda qaytarsin: {\"title\": \"...\", \"description\": \"...\"}";

        $raw = $this->chat($prompt);

        // JSON ajratib olish
        if (preg_match('/\{.*\}/s', $raw, $matches)) {
            $decoded = json_decode($matches[0], true);
            if (is_array($decoded)) {
                return $decoded;
            }
        }

        return ['title' => '', 'description' => $raw];
    }

    /**
     * Broadcast uchun marketing xabar yozadi (admin panel).
     */
    public function generateBroadcastMessage(string $topic): string
    {
        $prompt = "Telegram bot uchun marketing xabar yoz (o'zbek tilida, qisqa, emoji bilan).\n"
            . "Mavzu: {$topic}\n"
            . "Xizmatlar: PUBG UC, Mobile Legends Almaz, Telegram Stars, Telegram Premium sotamiz.";

        return $this->chat($prompt);
    }

    /**
     * Bot foydalanuvchi savoliga javob (ko'p tilli).
     */
    public function botAnswer(string $userMessage): string
    {
        $system = "Sen ROVA do'konining yordamchi botisan. "
            . "Do'kon xizmatlari: PUBG Mobile UC, Mobile Legends Almaz, Telegram Stars, Telegram Premium. "
            . "Foydalanuvchi qaysi tilda yozsa shu tilda qisqa va aniq javob ber. "
            . "Agar savol do'kon xizmatlariga taalluqli bo'lmasa, 'Bu haqida yordam bera olmayman' de.";

        return $this->chat($userMessage, $system);
    }
}
