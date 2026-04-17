<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Response;

class BroadcastNotificationController extends Controller
{
    public function index(): Response
    {
        $usersCount = (int) DB::table('users')->where('role', 'user')->count();

        return Inertia::render('Admin/BroadcastNotifications', [
            'stats' => [
                'users_count' => $usersCount,
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'title' => 'required|string|max:150',
            'message' => 'required|string|max:1000',
            'description' => 'nullable|string|max:1000',
        ]);

        if (!Schema::hasTable('user_notifications')) {
            return back()->with('error', 'user_notifications jadvali topilmadi');
        }

        $userIds = DB::table('users')
            ->where('role', 'user')
            ->pluck('id')
            ->all();

        if (count($userIds) === 0) {
            return back()->with('error', 'Broadcast uchun foydalanuvchi topilmadi');
        }

        $now = now();
        $payload = [];

        foreach ($userIds as $userId) {
            $payload[] = [
                'user_id' => (int) $userId,
                'source' => 'system',
                'order_type' => null,
                'order_id' => null,
                'status' => null,
                'title' => (string) $data['title'],
                'message' => (string) $data['message'],
                'description' => isset($data['description']) && trim((string) $data['description']) !== ''
                    ? (string) $data['description']
                    : null,
                'is_read' => false,
                'created_at' => $now,
            ];
        }

        foreach (array_chunk($payload, 500) as $chunk) {
            DB::table('user_notifications')->insert($chunk);
        }

        return back()->with('success', count($userIds) . " ta userga broadcast yuborildi");
    }
}

