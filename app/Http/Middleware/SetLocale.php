<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SetLocale
{
    private const SUPPORTED = ['uz', 'ru', 'en'];
    private const DEFAULT   = 'uz';

    public function handle(Request $request, Closure $next): Response
    {
        app()->setLocale($this->resolveLocale($request));
        return $next($request);
    }

    private function resolveLocale(Request $request): string
    {
        $header = (string) $request->header('Accept-Language', '');
        $lang   = strtolower(substr(trim(explode(',', $header)[0]), 0, 2));

        return in_array($lang, self::SUPPORTED, true) ? $lang : self::DEFAULT;
    }
}
