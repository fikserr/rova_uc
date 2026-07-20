<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
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

    private function resolveImageUrl(?string $value): ?string
    {
        if (!$value) {
            return null;
        }
        // Already a full URL (legacy records stored with Storage::url())
        if (str_starts_with($value, 'http://') || str_starts_with($value, 'https://')) {
            return $value;
        }
        // Relative path — generate URL using current APP_URL
        return Storage::disk('public')->url($value);
    }

    private function userNotifications(string $userId): Collection
    {
        if (!Schema::hasTable('user_notifications')) {
            return collect();
        }

        $hasImageUrl = Schema::hasColumn('user_notifications', 'image_url');

        $select = ['id', 'source', 'order_type', 'order_id', 'status', 'title', 'message', 'description', 'is_read', 'created_at'];
        if ($hasImageUrl) {
            $select[] = 'image_url';
        }

        $rows = DB::table('user_notifications')
            ->where('user_id', $userId)
            ->select($select)
            ->orderByDesc('created_at')
            ->limit(50)
            ->get();

        return $rows->map(fn ($row) => [
            'id'           => $row->id,
            'source'       => $row->source ?: 'admin',
            'order_type'   => $row->order_type,
            'order_id'     => $row->order_id,
            'order_status' => $row->status,
            'title'        => (string) ($row->title ?: ''),
            'message'      => (string) ($row->message ?: ''),
            'description'  => (string) ($row->description ?: ''),
            'image_url'    => $hasImageUrl ? $this->resolveImageUrl($row->image_url ?? null) : null,
            'is_read'      => (bool) $row->is_read ? 'read' : 'unread',
            'created_at'   => $row->created_at,
        ]);
    }
}
