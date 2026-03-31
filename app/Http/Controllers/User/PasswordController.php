<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Password;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class PasswordController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'password' => ['required', 'min:8'],
        ]);

        Password::updateOrCreate([
            'user_id' => auth()->id(),
        ], [
            'password' => Hash::make($data['password']),
        ]);

        return back()->with('success', 'Password saved successfully');
    }

    public function update(Request $request, $userId)
    {
        abort_unless((int) $userId === (int) auth()->id(), 403);

        $data = $request->validate([
            'current_password' => ['required'],
            'password' => ['required', 'min:8'],
        ]);

        $password = Password::where('user_id', $userId)->first();

        if (! $password) {
            return back()->withErrors([
                'current_password' => 'Password topilmadi',
            ]);
        }

        if (! Hash::check($data['current_password'], $password->password)) {
            return back()->withErrors([
                'current_password' => "Eski parolingiz to'g'ri emas",
            ]);
        }

        $password->update([
            'password' => Hash::make($data['password']),
        ]);

        return back()->with('success', 'Password updated successfully');
    }
}
