<?php

use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\VerifyTelegramWebApp;
use Illuminate\Http\Request;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__.'/../routes/api.php', // 🔥 SHU QATOR
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // Important for ngrok / reverse proxies so Laravel sees HTTPS scheme correctly.
        $middleware->trustProxies(
            at: '*',
            headers: Request::HEADER_X_FORWARDED_FOR
                | Request::HEADER_X_FORWARDED_HOST
                | Request::HEADER_X_FORWARDED_PORT
                | Request::HEADER_X_FORWARDED_PROTO
        );

        $middleware->alias([
            'telegram.webapp' => VerifyTelegramWebApp::class,
        ]);

        // Telegram WebApp session auth is protected by Telegram initData HMAC verification.
        // Excluding this route from CSRF avoids first-load 419 issues in mobile WebView.
        $middleware->validateCsrfTokens(except: [
            'telegram/webapp/session',
        ]);

        $middleware->web(append: [
            HandleInertiaRequests::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
