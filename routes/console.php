<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Schedule;
use Illuminate\Support\Facades\Schema;

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

    foreach ($rows as $row) {
        $title   = trim((string) ($row->title ?? 'Bildirishnoma'));
        $message = trim((string) ($row->message ?? ''));
        $desc    = trim((string) ($row->description ?? ''));

        $text = $title;
        if ($message !== '') $text .= "\n\n" . $message;
        if ($desc !== '')    $text .= "\n\nSabab: " . $desc;

        try {
            $res = Http::timeout(10)->post("https://api.telegram.org/bot{$token}/sendMessage", [
                'chat_id' => (int) $row->user_id,
                'text'    => $text,
            ]);
            $ok = ($res->json('ok') === true);
            $err = $ok ? null : (($res->json('description') ?: ('HTTP '.$res->status())) ?: 'unknown');
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
