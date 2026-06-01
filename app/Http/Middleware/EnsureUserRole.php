<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserRole
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();
        $userRole = (string) ($user?->role ?? '');

        if ($user && ($userRole === 'admin' || in_array($userRole, $roles, true))) {
            return $next($request);
        }

        if ($userRole === 'worker') {
            return redirect('/uc-orders');
        }

        if ($userRole === 'user') {
            return redirect('/user-services');
        }

        abort(403, 'Unauthorized role.');
    }
}
