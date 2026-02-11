<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\UserBalance;
use App\Services\TelegramAuthService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
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

        $user = $this->upsertUser($userPayload);

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

        if (isset($data['_fail'])) {
            $reason = $data['_fail'];
            Log::warning('Telegram sessionLogin: initData verification failed', [
                'reason' => $reason,
                'init_data_length' => strlen($initData),
                'auth_date' => $data['_auth_date'] ?? null,
            ]);
            $message = config('app.debug')
                ? ['message' => 'Invalid or expired init data', 'debug_reason' => $reason]
                : ['message' => 'Invalid or expired init data'];
            return response()->json($message, 401);
        }

        if (! $data) {
            return response()->json(['message' => 'Invalid or expired init data'], 401);
        }

        $userPayload = $this->extractUser($data);
        if (! $userPayload) {
            return response()->json(['message' => 'Missing user data'], 422);
        }

        try {
            $user = $this->upsertUser($userPayload);
            Auth::login($user, false);
            return response()->json([
                'status' => 'ok',
                'user' => $this->transformUser($user),
            ]);
        } catch (\Throwable $e) {
            Log::error('Telegram sessionLogin error', ['message' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json(['message' => 'Server error'], 500);
        }
    }

    public function me(Request $request)
    {
        $userPayload = $request->attributes->get('telegram_user');
        if (!$userPayload) {
            return response()->json(['message' => 'Missing user data'], 422);
        }

        $user = $this->upsertUser($userPayload);

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

    private function upsertUser(array $userPayload): User
    {
        $user = User::firstOrCreate(
            ['id' => $userPayload['id']],
            [
                'username' => $userPayload['username'] ?? null,
                'role' => 'user',
                'created_at' => now(),
            ]
        );

        if (($userPayload['username'] ?? null) && $user->username !== $userPayload['username']) {
            $user->update(['username' => $userPayload['username']]);
        }

        UserBalance::firstOrCreate(
            ['user_id' => $user->id],
            ['balance' => 0, 'updated_at' => now()]
        );

        return $user->fresh();
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
