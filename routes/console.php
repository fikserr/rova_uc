<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schedule;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Pending Telegram bildirishnomalarini yuborish (har daqiqada)
Schedule::call(function () {
    if (!Schema::hasTable('user_notifications')) return;

    $token = config('services.telegram.bot_token');
    if (!$token) return;

    $rows = DB::table('user_notifications')
        ->whereNull('tg_sent_at')
        ->where('tg_attempts', '<', 10)
        ->orderBy('id')
        ->limit(20)
        ->get();

    $hasImageCol = Schema::hasColumn('user_notifications', 'image_url');

    foreach ($rows as $row) {
        $title   = trim((string) ($row->title ?? 'Bildirishnoma'));
        $message = trim((string) ($row->message ?? ''));
        $desc    = trim((string) ($row->description ?? ''));

        $text = $title;
        if ($message !== '') $text .= "\n\n" . $message;
        if ($desc !== '')    $text .= "\n\nSabab: " . $desc;

        // Resolve image: stored as path (e.g. broadcast-images/xxx.jpg) or full URL
        $imageValue = $hasImageCol ? (trim((string) ($row->image_url ?? ''))) : '';
        $imagePath  = null; // local storage path
        $imageUrl   = null; // full URL for sendPhoto
        if ($imageValue !== '') {
            if (str_starts_with($imageValue, 'http://') || str_starts_with($imageValue, 'https://')) {
                $imageUrl = $imageValue;
            } else {
                $imagePath = $imageValue; // relative path in public disk
                $imageUrl  = Storage::disk('public')->url($imageValue);
            }
        }

        try {
            if ($imageUrl !== null) {
                // Try sendPhoto with file bytes for reliability
                $sent = false;
                if ($imagePath && Storage::disk('public')->exists($imagePath)) {
                    $bytes    = Storage::disk('public')->get($imagePath);
                    $filename = basename($imagePath);
                    $res = Http::timeout(15)
                        ->attach('photo', $bytes, $filename, ['Content-Type' => 'image/jpeg'])
                        ->post("https://api.telegram.org/bot{$token}/sendPhoto", [
                            'chat_id' => (int) $row->user_id,
                            'caption' => $text,
                        ]);
                    $sent = ($res->json('ok') === true);
                }
                // Fallback: send photo by URL
                if (!$sent) {
                    $res = Http::timeout(10)->post("https://api.telegram.org/bot{$token}/sendPhoto", [
                        'chat_id' => (int) $row->user_id,
                        'photo'   => $imageUrl,
                        'caption' => $text,
                    ]);
                    $sent = ($res->json('ok') === true);
                }
                // Fallback: send as plain text if photo failed
                if (!$sent) {
                    $res = Http::timeout(10)->post("https://api.telegram.org/bot{$token}/sendMessage", [
                        'chat_id' => (int) $row->user_id,
                        'text'    => $text,
                    ]);
                }
                $ok  = ($res->json('ok') === true);
                $err = $ok ? null : (($res->json('description') ?: ('HTTP '.$res->status())) ?: 'unknown');
            } else {
                $res = Http::timeout(10)->post("https://api.telegram.org/bot{$token}/sendMessage", [
                    'chat_id' => (int) $row->user_id,
                    'text'    => $text,
                ]);
                $ok  = ($res->json('ok') === true);
                $err = $ok ? null : (($res->json('description') ?: ('HTTP '.$res->status())) ?: 'unknown');
            }
        } catch (\Throwable $e) {
            $ok  = false;
            $err = substr($e->getMessage(), 0, 255);
        }

        $attempts = (int) ($row->tg_attempts ?? 0) + 1;
        DB::table('user_notifications')->where('id', $row->id)->update(
            $ok
                ? ['tg_sent_at' => now(), 'tg_attempts' => $attempts, 'tg_last_error' => null]
                : ['tg_attempts' => $attempts, 'tg_last_error' => $err]
        );
    }
})->everyMinute()->name('send-tg-notifications')->withoutOverlapping();

// SekalıPay processing orderlarini avtomatik tekshirish
Schedule::call(function () {
    if (!Schema::hasTable('sekali_orders')) return;

    $api            = app(\App\Services\SekaliPayService::class);
    $receiptService = app(\App\Services\ReceiptService::class);

    // 2 daqiqadan oshgan processing orderlarni tekshir
    $orders = DB::table('sekali_orders')
        ->where('status', 'processing')
        ->where('created_at', '<', now()->subMinutes(2))
        ->orderBy('id')
        ->limit(30)
        ->get(['id', 'ref_id', 'user_id', 'price_uzs', 'sekali_invoice']);

    $completedStatuses = ['completed', 'success', 'delivered', 'paid'];
    $canceledStatuses  = ['canceled', 'failed', 'refunded'];

    foreach ($orders as $order) {
        try {
            $result = $api->getTransaction($order->ref_id);

            // Raw response logini yozish
            Log::info("SekaliPay poller getTransaction #{$order->ref_id}", [
                'success' => $result['success'],
                'data'    => $result['data'],
            ]);

            if (!$result['success']) continue;

            $status  = $result['data']['status'] ?? $result['data']['transaction']['status'] ?? null;
            $invoice = $result['data']['invoice'] ?? $result['data']['transaction']['invoice'] ?? $order->sekali_invoice;

            if (in_array($status, $completedStatuses)) {
                $alreadyDone = false;

                DB::transaction(function () use ($order, $invoice, &$alreadyDone) {
                    $row = DB::table('sekali_orders')
                        ->where('ref_id', $order->ref_id)
                        ->lockForUpdate()
                        ->first();

                    if (!$row || $row->status === 'completed') {
                        $alreadyDone = true;
                        return;
                    }

                    DB::table('sekali_orders')->where('ref_id', $order->ref_id)->update([
                        'status'         => 'completed',
                        'sekali_invoice' => $invoice,
                    ]);
                });

                if (!$alreadyDone) {
                    Log::info("SekaliPay poller: #{$order->ref_id} completed");
                    $receiptService->record('sekali', $order->ref_id);
                }

            } elseif (in_array($status, ['failed', 'canceled', 'refunded'])) {
                $wasCanceled = false;
                DB::transaction(function () use ($order, $status, &$wasCanceled) {
                    $row = DB::table('sekali_orders')
                        ->where('ref_id', $order->ref_id)
                        ->lockForUpdate()
                        ->first();

                    if (!$row || in_array($row->status, ['completed', 'canceled', 'failed'])) return;

                    DB::table('user_balances')
                        ->where('user_id', $order->user_id)
                        ->increment('balance', $order->price_uzs);

                    DB::table('sekali_orders')->where('ref_id', $order->ref_id)->update([
                        'status' => 'canceled',
                        'notes'  => "Avtomatik bekor: SekalıPay status={$status}",
                    ]);
                    $wasCanceled = true;
                });

                Log::info("SekaliPay poller: #{$order->ref_id} bekor qilindi ({$status}), balans qaytarildi.");

                if ($wasCanceled) {
                    try {
                        $sekaliOrder = DB::table('sekali_orders')->where('ref_id', $order->ref_id)->first();
                        $product = $sekaliOrder ? DB::table('sekali_products')->where('id', $sekaliOrder->sekali_product_id)->first() : null;
                        $productName = $product ? ($product->game_name . ' — ' . $product->name) : 'SekalıPay';
                        app(\App\Services\TelegramNotificationService::class)->notifyOrderStatus(
                            (string) $order->user_id,
                            'sekali',
                            (int) $order->id,
                            'canceled',
                            $productName,
                            'Balans qaytarildi'
                        );
                    } catch (\Throwable) {}
                }
            }
        } catch (\Throwable $e) {
            Log::warning("SekaliPay poller xatolik #{$order->ref_id}: " . $e->getMessage());
        }
    }
})->everyMinute()->name('sekali-order-poller')->withoutOverlapping();
