<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class TwoFactorController extends Controller
{
    private function generateSecret(): string
    {
        $chars  = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
        $secret = '';
        for ($i = 0; $i < 16; $i++) {
            $secret .= $chars[random_int(0, strlen($chars) - 1)];
        }
        return $secret;
    }

    /**
     * TODO: Implement proper RFC 4648 base32 decoding.
     * Consider using a package such as spomky-labs/otphp or a standalone
     * base32 library before enabling 2FA in production.
     */
    private function base32Decode(string $secret): string
    {
        // TODO: replace this stub with a real base32 decoder
        $alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
        $bits      = '';
        foreach (str_split(strtoupper($secret)) as $char) {
            $pos = strpos($alphabet, $char);
            if ($pos === false) continue;
            $bits .= str_pad(decbin($pos), 5, '0', STR_PAD_LEFT);
        }
        $output = '';
        foreach (str_split($bits, 8) as $byte) {
            if (strlen($byte) === 8) {
                $output .= chr(bindec($byte));
            }
        }
        return $output;
    }

    private function verifyTotp(string $secret, string $code): bool
    {
        $timestamp = (int) floor(time() / 30);
        $key       = $this->base32Decode($secret);

        for ($i = -1; $i <= 1; $i++) {
            $t    = pack('N*', 0) . pack('N*', $timestamp + $i);
            $hash = hash_hmac('sha1', $t, $key, true);
            $offset = ord($hash[19]) & 0xf;
            $otp  = (
                ((ord($hash[$offset])     & 0x7f) << 24)
                | ((ord($hash[$offset + 1]) & 0xff) << 16)
                | ((ord($hash[$offset + 2]) & 0xff) << 8)
                |  (ord($hash[$offset + 3]) & 0xff)
            ) % 1_000_000;

            if (str_pad((string) $otp, 6, '0', STR_PAD_LEFT) === $code) {
                return true;
            }
        }
        return false;
    }

    public function setup(): \Inertia\Response
    {
        $user   = auth()->user();
        $secret = DB::table('users')->where('id', $user->id)->value('two_factor_secret');
        $enabled = (bool) DB::table('users')->where('id', $user->id)->value('two_factor_enabled');

        return Inertia::render('User/TwoFactorSetup', [
            'hasSecret'  => !empty($secret),
            'isEnabled'  => $enabled,
            'qrUrl'      => $secret
                ? "otpauth://totp/RovaUC:{$user->username}?secret={$secret}&issuer=RovaUC"
                : null,
        ]);
    }

    /** Generate (or regenerate) a TOTP secret. Resets enabled flag if regenerated. */
    public function generate()
    {
        $user   = auth()->user();
        $secret = $this->generateSecret();

        DB::table('users')->where('id', $user->id)->update([
            'two_factor_secret'  => $secret,
            'two_factor_enabled' => false,
        ]);

        return redirect()->route('2fa.setup');
    }

    public function enable(Request $request)
    {
        $request->validate(['code' => 'required|string|size:6']);

        $user   = auth()->user();
        $secret = DB::table('users')->where('id', $user->id)->value('two_factor_secret');

        if (!$secret) {
            return back()->withErrors(['code' => 'Avval maxfiy kalit yarating']);
        }

        if (!$this->verifyTotp($secret, $request->code)) {
            return back()->withErrors(['code' => "Noto'g'ri kod"]);
        }

        DB::table('users')->where('id', $user->id)->update(['two_factor_enabled' => true]);
        return back()->with('success', '2FA yoqildi');
    }

    public function disable(Request $request)
    {
        $request->validate(['code' => 'required|string|size:6']);

        $user   = auth()->user();
        $secret = DB::table('users')->where('id', $user->id)->value('two_factor_secret');

        if (!$this->verifyTotp($secret ?? '', $request->code)) {
            return back()->withErrors(['code' => "Noto'g'ri kod"]);
        }

        DB::table('users')
            ->where('id', $user->id)
            ->update(['two_factor_enabled' => false, 'two_factor_secret' => null]);

        return back()->with('success', "2FA o'chirildi");
    }

    /** Show 2FA challenge page after password login. */
    public function showChallenge(): \Inertia\Response|\Illuminate\Http\RedirectResponse
    {
        if (!session()->has('2fa_pending_user_id')) {
            return redirect()->route('login');
        }

        return \Inertia\Inertia::render('Auth/TwoFactorChallenge');
    }

    /** Verify the TOTP code submitted on the challenge page. */
    public function challenge(Request $request): \Illuminate\Http\RedirectResponse
    {
        if (!session()->has('2fa_pending_user_id')) {
            return redirect()->route('login');
        }

        $request->validate(['code' => 'required|string|size:6']);

        $userId = (string) session('2fa_pending_user_id');
        $secret = DB::table('users')->where('id', $userId)->value('two_factor_secret');

        if (!$secret || !$this->verifyTotp($secret, $request->code)) {
            return back()->withErrors(['code' => "Noto'g'ri kod yoki kod muddati o'tgan"]);
        }

        $remember = (bool) session('2fa_remember', false);
        session()->forget(['2fa_pending_user_id', '2fa_remember']);

        \Illuminate\Support\Facades\Auth::loginUsingId($userId, $remember);
        $request->session()->regenerate();

        return redirect()->intended('/');
    }
}
