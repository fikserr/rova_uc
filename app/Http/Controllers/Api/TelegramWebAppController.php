<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\UserBalance;
use App\Services\TelegramAuthService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class TelegramWebAppController extends Controller
{
    /**
     * Authenticate via initData and return JSON (for API clients).
     */
    public function authenticate(Request $request)
    {
        $initData = $this->getInitDataFromRequest($request);

        $data = TelegramAuthService::verify($initData);
        if (!$data) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $userPayload = $this->extractUser($data);
        if (!$userPayload) {
            return response()->json(['message' => 'Missing user data'], 422);
        }

        $user = $this->findRegisteredUser($userPayload);
        if (! $user) {
            Log::warning('Telegram authenticate rejected: user not registered or missing phone', [
                'telegram_id' => $userPayload['id'] ?? null,
                'username' => $userPayload['username'] ?? null,
            ]);
            return response()->json(['message' => __('auth.phone_required')], 403);
        }

        return response()->json([
            'status' => 'ok',
            'user' => $this->transformUser($user),
        ]);
    }

    /**
     * WebView session login: verify initData, create/update user, log in via session.
     * No login/password; auth is based only on Telegram data.
     */
    public function sessionLogin(Request $request)
    {
        $initData = $this->getInitDataFromRequest($request);

        $data = TelegramAuthService::verify($initData);

        if (isset($data['_fail']) || ! $data) {
            $reason = $data['_fail'] ?? 'unknown';
            Log::warning('Telegram sessionLogin: initData verification failed', [
                'reason' => $reason,
                'init_data_length' => strlen($initData),
                'auth_date' => $data['_auth_date'] ?? null,
            ]);
            if ($request->expectsJson()) {
                $message = config('app.debug')
                    ? ['message' => 'Invalid or expired init data', 'debug_reason' => $reason]
                    : ['message' => 'Invalid or expired init data'];
                return response()->json($message, 401);
            }
            return redirect('/login?reason=auth_failed');
        }

        $userPayload = $this->extractUser($data);
        if (! $userPayload) {
            return response()->json(['message' => 'Missing user data'], 422);
        }

        try {
            $user = $this->findRegisteredUser($userPayload);
            if (! $user) {
                Log::warning('Telegram sessionLogin rejected: user not registered or missing phone', [
                    'telegram_id' => $userPayload['id'] ?? null,
                    'username' => $userPayload['username'] ?? null,
                ]);
                if (! $request->expectsJson()) {
                    return redirect('/login?reason=phone_required');
                }
                return response()->json(['message' => __('auth.phone_required')], 403);
            }

            if ($user->is_blocked) {
                if ($request->expectsJson()) {
                    return response()->json(['message' => 'Hisobingiz bloklangan. Admin bilan bog\'laning.'], 403);
                }
                return redirect('/login');
            }

            // Eski sessionni to'liq tozalaymiz (Android multi-account bug fix)
            if (Auth::check()) {
                Auth::logout();
                $request->session()->invalidate();
                $request->session()->regenerateToken();
            }

            Auth::login($user, false);
            $request->session()->regenerate();

            // Form POST (Android) → redirect; fetch (AJAX) → JSON
            if (! $request->expectsJson()) {
                return redirect('/');
            }

            return response()->json([
                'status' => 'ok',
                'user' => $this->transformUser($user),
            ]);
        } catch (\Throwable $e) {
            Log::error('Telegram sessionLogin error', ['message' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            if (! $request->expectsJson()) {
                return redirect('/login');
            }
            return response()->json(['message' => 'Server error'], 500);
        }
    }

    public function me(Request $request)
    {
        $userPayload = $request->attributes->get('telegram_user');
        if (!$userPayload) {
            return response()->json(['message' => 'Missing user data'], 422);
        }

        $user = $this->findRegisteredUser($userPayload);
        if (! $user) {
            Log::warning('Telegram me rejected: user not registered or missing phone', [
                'telegram_id' => $userPayload['id'] ?? null,
                'username' => $userPayload['username'] ?? null,
            ]);
            return response()->json(['message' => __('auth.phone_required')], 403);
        }

        return response()->json([
            'status' => 'ok',
            'user' => $this->transformUser($user),
        ]);
    }

    private function extractUser(array $data): ?array
    {
        if (empty($data['user'])) {
            return null;
        }

        $user = $data['user'];
        if (is_string($user)) {
            $user = json_decode($user, true);
        }
        if (! is_array($user) || empty($user['id'])) {
            return null;
        }

        return $user;
    }

    private function findRegisteredUser(array $userPayload): ?User
    {
        // Keep as string to avoid any integer overflow/truncation on 32-bit PDO
        $tidStr = (string) ($userPayload['id'] ?? '');
        if ($tidStr === '' || $tidStr === '0') {
            return null;
        }

        // Reject anything that is not a plain positive integer (SQL injection guard)
        if (! ctype_digit($tidStr)) {
            return null;
        }

        // Use raw SQL for the existence check (safest for large Telegram IDs)
        $raw = DB::selectOne("SELECT * FROM users WHERE id = {$tidStr} LIMIT 1");
        if (! $raw || empty($raw->phone_number)) {
            return null;
        }

        if (($userPayload['username'] ?? null) && $raw->username !== $userPayload['username']) {
            DB::statement("UPDATE users SET username = ? WHERE id = {$tidStr}", [$userPayload['username']]);
        }

        DB::statement(
            "INSERT IGNORE INTO user_balances (user_id, balance, updated_at) VALUES ({$tidStr}, 0, NOW())"
        );

        // User model now has keyType='string', so find() binds via PARAM_STR (no truncation)
        return User::find($tidStr);
    }

    private function getInitDataFromRequest(Request $request): string
    {
        // Try header first
        if ($initData = $request->header('X-Telegram-Init-Data')) {
            return (string) $initData;
        }

        // Try query parameters
        if ($initData = $request->query('initData') ?? $request->query('init_data')) {
            return (string) $initData;
        }

        // Try form/input data
        if ($initData = $request->input('initData') ?? $request->input('init_data')) {
            return (string) $initData;
        }

        // Try JSON body if Content-Type is application/json
        if ($request->isJson()) {
            $json = $request->json()->all();
            if ($initData = $json['initData'] ?? $json['init_data']) {
                return (string) $initData;
            }
        }

        return '';
    }

    private function transformUser(User $user): array
    {
        return [
            'id' => $user->id,
            'username' => $user->username,
            'phone_number' => $user->phone_number,
            'role' => $user->role,
        ];
    }
}
