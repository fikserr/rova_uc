<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Password;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class AdminSecurityController extends Controller
{
    public function index()
    {
        $hasPassword = Password::where('user_id', auth()->id())->exists();

        return Inertia::render('Admin/Security', [
            'hasPassword' => $hasPassword,
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
