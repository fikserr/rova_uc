<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ManualTopupController extends Controller
{
    public function index(): Response
    {
        $requests = DB::table('manual_topup_requests as r')
            ->leftJoin('users as u', 'u.id', '=', 'r.user_id')
            ->orderByDesc('r.id')
            ->select(['r.id', 'r.user_id', 'r.amount', 'r.photo_file_id', 'r.status', 'r.notes', 'r.created_at', 'u.username'])
            ->get()
            ->map(fn ($row) => [
                'id'          => $row->id,
                'user_id'     => $row->user_id,
                'username'    => $row->username ?? '-',
                'amount'      => (float) $row->amount,
                'receipt_url' => Storage::url($row->photo_file_id),
                'status'      => $row->status,
                'notes'       => $row->notes,
                'created_at'  => $row->created_at,
            ]);

        return Inertia::render('Admin/ManualTopups', [
            'requests' => $requests->values(),
            'pending'  => $requests->where('status', 'pending')->count(),
        ]);
    }

    public function approve(int $id): RedirectResponse
    {
        try {
            $approvedAmount = DB::transaction(function () use ($id) {
                // Re-read with lock inside transaction — prevents double-approval
                $topup = DB::table('manual_topup_requests')
                    ->where('id', $id)
                    ->where('status', 'pending')
                    ->lockForUpdate()
                    ->first();

                if (!$topup) {
                    throw new \RuntimeException('already_processed');
                }

                $amount = (float) $topup->amount;
                $userId = (int) $topup->user_id;

                DB::table('manual_topup_requests')->where('id', $id)->update(['status' => 'approved']);

                $balanceRow = DB::table('user_balances')
                    ->where('user_id', $userId)
                    ->lockForUpdate()
                    ->first();

                if ($balanceRow) {
                    DB::table('user_balances')->where('user_id', $userId)->update([
                        'balance'    => (float) $balanceRow->balance + $amount,
                        'updated_at' => now(),
                    ]);
                } else {
                    DB::table('user_balances')->insert([
                        'user_id'    => $userId,
                        'balance'    => $amount,
                        'updated_at' => now(),
                    ]);
                }

                DB::table('payments')->insert([
                    'user_id'        => $userId,
                    'click_trans_id' => 'MANUAL-' . $id . '-' . now()->timestamp,
                    'amount'         => $amount,
                    'currency'       => 'UZS',
                    'provider'       => 'manual',
                    'status'         => 'paid',
                    'created_at'     => now(),
                    'updated_at'     => now(),
                ]);

                if (Schema::hasTable('user_notifications')) {
                    DB::table('user_notifications')->insert([
                        'user_id'     => $userId,
                        'source'      => 'system',
                        'order_type'  => null,
                        'order_id'    => null,
                        'status'      => null,
                        'title'       => "✅ Balans to'ldirildi",
                        'message'     => number_format($amount, 0, '.', ' ') . " so'm balansingizga qo'shildi.",
                        'description' => null,
                        'is_read'     => false,
                        'created_at'  => now(),
                    ]);
                }

                Log::info('Manual topup approved', [
                    'topup_id' => $id,
                    'admin_id' => auth()->id(),
                    'amount'   => $amount,
                    'user_id'  => $userId,
                ]);

                return $amount;
            });

            return back()->with('success', number_format($approvedAmount, 0, '.', ' ') . " so'm tasdiqlandi");

        } catch (\RuntimeException $e) {
            if ($e->getMessage() === 'already_processed') {
                return back()->with('error', "So'rov topilmadi yoki allaqachon ko'rib chiqilgan");
            }
            throw $e;
        }
    }

    public function reject(Request $request, int $id): RedirectResponse
    {
        $data = $request->validate([
            'notes' => 'nullable|string|max:500',
        ]);

        $affected = DB::table('manual_topup_requests')
            ->where('id', $id)
            ->where('status', 'pending')
            ->update([
                'status' => 'rejected',
                'notes'  => $data['notes'] ?? null,
            ]);

        if (!$affected) {
            return back()->with('error', "So'rov topilmadi yoki allaqachon ko'rib chiqilgan");
        }

        $topup = DB::table('manual_topup_requests')->where('id', $id)->first();
        $userId = (int) $topup->user_id;
        $amount = (float) $topup->amount;

        if (Schema::hasTable('user_notifications')) {
            DB::table('user_notifications')->insert([
                'user_id'     => $userId,
                'source'      => 'system',
                'order_type'  => null,
                'order_id'    => null,
                'status'      => null,
                'title'       => "❌ Chek rad etildi",
                'message'     => number_format($amount, 0, '.', ' ') . " so'mlik chekingiz rad etildi.",
                'description' => $data['notes'] ?? null,
                'is_read'     => false,
                'created_at'  => now(),
            ]);
        }

        Log::info('Manual topup rejected', [
            'topup_id' => $id,
            'admin_id' => auth()->id(),
            'notes'    => $data['notes'] ?? null,
        ]);

        return back()->with('success', 'Rad etildi');
    }
}
