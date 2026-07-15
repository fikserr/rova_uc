<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Password;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class AdminSecurityController extends Controller
{
    public function index()
    {
        $userId      = auth()->id();
        $hasPassword = Password::where('user_id', $userId)->exists();

        $user = DB::table('users')->where('id', $userId)
            ->select('email', 'email_verified_at', 'two_factor_secret', 'two_factor_enabled')
            ->first();

        $hasSecret = !empty($user?->two_factor_secret);
        $isEnabled = (bool) ($user?->two_factor_enabled ?? false);
        $qrUrl     = null;
        if ($hasSecret) {
            $username = auth()->user()?->username ?? 'admin';
            $qrUrl    = "otpauth://totp/RovaUC:{$username}?secret={$user->two_factor_secret}&issuer=RovaUC";
        }

        return Inertia::render('Admin/Security', [
            'hasPassword'       => $hasPassword,
            'userEmail'         => $user?->email,
            'emailVerifiedAt'   => $user?->email_verified_at,
            'hasSecret'         => $hasSecret,
            'isEnabled'         => $isEnabled,
            'qrUrl'             => $qrUrl,
        ]);
    }

    public function setPassword(Request $request)
    {
        $request->validate([
            'password'              => ['required', 'string', 'min:8', 'confirmed'],
            'password_confirmation' => ['required'],
        ]);

        Password::updateOrCreate(
            ['user_id' => auth()->id()],
            ['password' => Hash::make($request->password)]
        );

        return back()->with('success', 'Parol muvaffaqiyatli o\'rnatildi');
    }

    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password'      => ['required'],
            'password'              => ['required', 'string', 'min:8', 'confirmed'],
            'password_confirmation' => ['required'],
        ]);

        $record = Password::where('user_id', auth()->id())->first();

        if (! $record) {
            return back()->withErrors(['current_password' => 'Avval parol o\'rnatilmagan']);
        }

        if (! Hash::check($request->current_password, $record->password)) {
            return back()->withErrors(['current_password' => 'Joriy parol noto\'g\'ri']);
        }

        $record->update(['password' => Hash::make($request->password)]);

        return back()->with('success', 'Parol muvaffaqiyatli yangilandi');
    }
}
