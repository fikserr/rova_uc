<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
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
            'title'       => 'required|string|max:150',
            'message'     => 'required|string|max:1000',
            'description' => 'nullable|string|max:1000',
            'image'       => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120',
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

        $imageUrl = null;
        if ($request->hasFile('image')) {
            // Store path only — URL is generated at read time to avoid APP_URL mismatches
            $imageUrl = $request->file('image')->store('broadcast-images', 'public');
        }

        $now         = now();
        $payload     = [];
        $description = isset($data['description']) && trim((string) $data['description']) !== ''
            ? (string) $data['description']
            : null;

        $hasImageUrl = Schema::hasColumn('user_notifications', 'image_url');

        foreach ($userIds as $userId) {
            $row = [
                'user_id'     => (int) $userId,
                'source'      => 'system',
                'order_type'  => null,
                'order_id'    => null,
                'status'      => null,
                'title'       => (string) $data['title'],
                'message'     => (string) $data['message'],
                'description' => $description,
                'is_read'     => false,
                'created_at'  => $now,
            ];

            if ($hasImageUrl) {
                $row['image_url'] = $imageUrl;
            }

            $payload[] = $row;
        }

        foreach (array_chunk($payload, 500) as $chunk) {
            DB::table('user_notifications')->insert($chunk);
        }

        return back()->with('success', count($userIds) . " ta userga broadcast yuborildi");
    }
}
