<?php

namespace App\Http\Middleware;

use App\Services\TelegramAuthService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class VerifyTelegramWebApp
{
    public function handle(Request $request, Closure $next): Response
    {
        $initData = $this->getInitData($request);
        $data = TelegramAuthService::verify($initData);

        if (!$data) {
            if ($request->expectsJson()) {
                return response()->json(['message' => 'Unauthorized'], 401);
            }

            abort(403); // yoki redirect
        }

        $user = $this->extractUser($data);
        if ($user) {
            $request->attributes->set('telegram_user', $user);
        }

        $request->attributes->set('telegram_init_data', $data);

        return $next($request);
    }

    private function getInitData(Request $request): string
    {
        return (string) ($request->header('X-Telegram-Init-Data')
            ?? $request->input('initData')
            ?? $request->input('init_data')
            ?? $request->query('initData')
            ?? $request->query('init_data')
            ?? '');
    }

    private function extractUser(array $data): ?array
    {
        if (empty($data['user']) || !is_string($data['user'])) {
            return null;
        }

        $user = json_decode($data['user'], true);
        if (!is_array($user) || empty($user['id'])) {
            return null;
        }

        return $user;
    }
}
