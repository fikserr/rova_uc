<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Mail\EmailVerificationCode;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\RateLimiter;

class EmailVerificationController extends Controller
{
    // 6 ta raqamli tasodifiy kod
    private function generateCode(): string
    {
        return str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
    }

    public function sendCode(Request $request): JsonResponse
    {
        $request->validate([
            'email' => ['required', 'email', 'max:191'],
        ]);

        $userId = auth()->id();
        $email  = strtolower(trim($request->email));

        // Rate limit: 3 ta urinish 10 daqiqada
        $key = "email-code:{$userId}";
        if (RateLimiter::tooManyAttempts($key, 3)) {
            $seconds = RateLimiter::availableIn($key);
            return response()->json([
                'message' => "Juda ko'p urinish. {$seconds} soniyadan keyin qayta urining.",
            ], 429);
        }
        RateLimiter::hit($key, 600);

        // Boshqa userda bu email bormi?
        $taken = DB::table('users')
            ->where('email', $email)
            ->where('id', '!=', $userId)
            ->exists();

        if ($taken) {
            return response()->json([
                'message' => 'Bu email boshqa foydalanuvchiga tegishli.',
            ], 422);
        }

        $code = $this->generateCode();

        // Eski kodlarni o'chirib yangi kod saqlash
        DB::table('email_verifications')->where('user_id', $userId)->delete();
        DB::table('email_verifications')->insert([
            'user_id'    => $userId,
            'email'      => $email,
            'code'       => $code,
            'expires_at' => now()->addMinutes(10),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        Mail::to($email)->send(new EmailVerificationCode(
            code:    $code,
            appName: config('app.name', 'App'),
        ));

        return response()->json(['message' => 'Kod yuborildi. Emailingizni tekshiring.']);
    }

    public function verify(Request $request): JsonResponse
    {
        $request->validate([
            'code' => ['required', 'digits:6'],
        ]);

        $userId = auth()->id();

        $record = DB::table('email_verifications')
            ->where('user_id', $userId)
            ->latest('id')
            ->first();

        if (! $record) {
            return response()->json(['message' => 'Avval kod so\'lang.'], 422);
        }

        if (now()->isAfter($record->expires_at)) {
            DB::table('email_verifications')->where('user_id', $userId)->delete();
            return response()->json(['message' => 'Kod muddati tugagan. Qayta yuboring.'], 422);
        }

        if ($record->code !== $request->code) {
            return response()->json(['message' => 'Kod noto\'g\'ri.'], 422);
        }

        // Email ni tasdiqlash
        DB::table('users')->where('id', $userId)->update([
            'email'             => $record->email,
            'email_verified_at' => now(),
        ]);

        DB::table('email_verifications')->where('user_id', $userId)->delete();

        RateLimiter::clear("email-code:{$userId}");

        return response()->json([
            'message' => 'Email muvaffaqiyatli tasdiqlandi!',
            'email'   => $record->email,
        ]);
    }

    public function remove(Request $request): JsonResponse
    {
        DB::table('users')->where('id', auth()->id())->update([
            'email'             => null,
            'email_verified_at' => null,
        ]);

        return response()->json(['message' => 'Email o\'chirildi.']);
    }
}
