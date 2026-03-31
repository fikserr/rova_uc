<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class LoginController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'username' => ['required'],
            'password' => ['required'],
            'remember' => ['nullable', 'boolean'],
        ]);

        $user = User::where('username', $data['username'])->first();

        if (! $user) {
            return back()->withErrors([
                'username' => 'Foydalanuvchi topilmadi',
            ]);
        }

        $password = $user->password;

        if (! $password || ! Hash::check($data['password'], $password->password)) {
            return back()->withErrors([
                'password' => "Parol noto'g'ri",
            ]);
        }

        Auth::login($user, $request->boolean('remember'));
        $request->session()->regenerate();

        return redirect()->intended('/');
    }

    public function destroy(Request $request)
    {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/login');
    }
}
