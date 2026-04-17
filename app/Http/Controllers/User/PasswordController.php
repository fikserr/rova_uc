<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Password;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class PasswordController extends Controller
{
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'password' => ['required', 'min:8'],
        ]);

        if ($validator->fails()) {
            return redirect('/user-profile/security')->withErrors($validator);
        }

        $data = $validator->validated();

        Password::updateOrCreate([
            'user_id' => auth()->id(),
        ], [
            'password' => Hash::make($data['password']),
        ]);

        return redirect('/user-profile/security')->with('success', 'Parol muvaffaqiyatli o`rnatildi');
    }

    public function update(Request $request, $userId)
    {
        abort_unless((int) $userId === (int) auth()->id(), 403);

        $validator = Validator::make($request->all(), [
            'current_password' => ['required'],
            'password' => ['required', 'min:8'],
        ]);

        if ($validator->fails()) {
            return redirect('/user-profile/security')->withErrors($validator);
        }

        $data = $validator->validated();
        $password = Password::where('user_id', $userId)->first();

        if (! $password) {
            return redirect('/user-profile/security')->withErrors([
                'current_password' => 'Password topilmadi',
            ]);
        }

        if (! Hash::check($data['current_password'], $password->password)) {
            return redirect('/user-profile/security')->withErrors([
                'current_password' => "Eski parolingiz to'g'ri emas",
            ]);
        }

        $password->update([
            'password' => Hash::make($data['password']),
        ]);

        return redirect('/user-profile/security')->with('success', 'Parol muvaffaqiyatli yangilandi');
    }
}
