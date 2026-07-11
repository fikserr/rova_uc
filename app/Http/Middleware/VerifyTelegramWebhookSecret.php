<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class VerifyTelegramWebhookSecret
{
    public function handle(Request $request, Closure $next): Response
    {
        $secret = config('services.telegram.webhook_secret', '');

        // If no secret is configured, skip check (backward compatible for local dev)
        if ($secret === '') {
            return $next($request);
        }

        $incoming = $request->header('X-Telegram-Bot-Api-Secret-Token', '');

        if (! hash_equals($secret, $incoming)) {
            return response('', 403);
        }

        return $next($request);
    }
}
