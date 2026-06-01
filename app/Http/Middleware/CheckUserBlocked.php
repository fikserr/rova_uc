<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class CheckUserBlocked
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && $user->is_blocked) {
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            if ($request->expectsJson()) {
                return response()->json(['message' => 'Hisobingiz bloklangan.'], 403);
            }

            return redirect('/login')->withErrors([
                'username' => 'Sizning hisobingiz bloklangan. Murojaat uchun admin bilan bog\'laning.',
            ]);
        }

        return $next($request);
    }
}
