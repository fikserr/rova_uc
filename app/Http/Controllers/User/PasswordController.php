<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Password;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class PasswordController extends Controller
{
    public function store(Request $request)
    {
        Log::info('Password store request', $request->all());

        $data = $request->validate([
            'password' => ['required', 'min:8'],
        ]);

        $userId = auth()->id();

        Password::create([
            'user_id' => $userId,
            'password' => Hash::make($data['password']),
        ]);

        Log::info('Password created', [
            'user_id' => $userId
        ]);

        return back()->with('success', 'Password saved successfully');
    }

    public function update(Request $request, $userId)
    {
        Log::info('Password update request', [
            'user_id' => $userId,
            'request' => $request->all()
        ]);

        $data = $request->validate([
            'current_password' => ['required'],
            'password' => ['required', 'min:8'],
        ]);

        $password = Password::where('user_id', $userId)->first();

        if (!$password) {
            return back()->withErrors([
                'current_password' => 'Password topilmadi'
            ]);
        }

        // eski parolni tekshiramiz
        if (!Hash::check($data['current_password'], $password->password)) {

            Log::warning('Wrong current password', [
                'user_id' => $userId
            ]);

            return back()->withErrors([
                'current_password' => 'Eski parolingiz to‘g‘ri emas'
            ]);
        }

        $password->update([
            'password' => Hash::make($data['password'])
        ]);

        Log::info('Password updated', [
            'user_id' => $userId
        ]);

        return back()->with('success', 'Password updated successfully');
    }
}