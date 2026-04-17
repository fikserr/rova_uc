<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;

class ManualTopupController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'amount'  => 'required|numeric|min:1000|max:50000000',
            'receipt' => 'required|image|mimes:jpeg,png,webp|max:10240',
        ]);

        $path = $request->file('receipt')->store('topup-receipts', 'public');

        DB::table('manual_topup_requests')->insert([
            'user_id'        => auth()->id(),
            'amount'         => $data['amount'],
            'photo_file_id'  => $path,
            'status'         => 'pending',
            'admin_messages' => json_encode([]),
            'created_at'     => now(),
        ]);

        $this->notifyAdmins((float) $data['amount'], (int) auth()->id());

        return response()->json([
            'message' => "Chekingiz qabul qilindi. Ko'rib chiqilgandan so'ng balansingizga qo'shiladi.",
        ]);
    }

    public function myRequests(): JsonResponse
    {
        $rows = DB::table('manual_topup_requests')
            ->where('user_id', auth()->id())
            ->orderByDesc('id')
            ->limit(10)
            ->get(['id', 'amount', 'status', 'notes', 'created_at']);

        return response()->json($rows);
    }

    private function notifyAdmins(float $amount, int $userId): void
    {
        if (!Schema::hasTable('user_notifications')) {
            return;
        }

        $adminIds = DB::table('users')->where('role', 'admin')->pluck('id');
        if ($adminIds->isEmpty()) {
            return;
        }

        $user     = DB::table('users')->where('id', $userId)->first();
        $username = $user?->username ? '@' . $user->username : "User #{$userId}";

        $now  = now();
        $rows = $adminIds->map(fn ($id) => [
            'user_id'     => (int) $id,
            'source'      => 'system',
            'order_type'  => null,
            'order_id'    => null,
            'status'      => null,
            'title'       => "💳 Yangi chek so'rovi",
            'message'     => "{$username} — " . number_format($amount, 0, '.', ' ') . " so'm",
            'description' => null,
            'is_read'     => false,
            'created_at'  => $now,
        ])->all();

        DB::table('user_notifications')->insert($rows);
    }
}
