<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    public function index(): Response
    {
        $userId = auth()->id();

        $items = $this->userNotifications($userId);

        return Inertia::render('User/UserNotifications', [
            'notifications' => $items,
            'stats' => [
                'total' => $items->count(),
                'system' => $items->where('source', 'system')->count(),
                'orders' => $items->where('source', 'admin')->count(),
            ],
        ]);
    }

    public function markAsRead(int $id): RedirectResponse
    {
        DB::table('user_notifications')
            ->where('id', $id)
            ->where('user_id', auth()->id())
            ->update(['is_read' => true]);

        return back();
    }

    private function userNotifications(int $userId): Collection
    {
        if (!Schema::hasTable('user_notifications')) {
            return collect();
        }

        $rows = DB::table('user_notifications')
            ->where('user_id', $userId)
            ->select(['id', 'source', 'order_type', 'order_id', 'status', 'title', 'message', 'description', 'is_read', 'created_at'])
            ->orderByDesc('created_at')
            ->limit(50)
            ->get();

        return $rows->map(fn ($row) => [
            'id' => $row->id,
            'source' => $row->source ?: 'admin',
            'title' => (string) ($row->title ?: 'Bildirishnoma'),
            'message' => (string) ($row->message ?: ''),
            'description' => (string) ($row->description ?: ''),
            'status' => (bool) $row->is_read ? 'read' : 'unread',
            'created_at' => $row->created_at,
        ]);
    }
}
