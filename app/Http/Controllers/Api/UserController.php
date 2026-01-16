<?php

// app/Http/Controllers/Api/UserController.php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\UserBalance;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index()
    {
        $users = User::with('balance')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'username' => $user->username,
                    'phone_number' => $user->phone_number,
                    'balance' => $user->balance?->balance ?? 0,
                    'role' => $user->role,
                     'created_at' => now()
                ];
            });

        return Inertia::render('Admin/Users', [
            'users' => $users
        ]);
    }
    // /start bosilganda
    public function start(Request $request)
    {
        $request->validate([
            'telegram_id' => 'required|integer',
            'username' => 'nullable|string'
        ]);

        // User yaratish yoki topish
        $user = User::firstOrCreate(
            ['id' => $request->telegram_id],
            [
                'username' => $request->username,
                'role' => 'user',
                'created_at' => now()
            ]
        );

        // Wallet yaratish
        UserBalance::firstOrCreate(
            ['user_id' => $user->id],
            ['balance' => 0, 'updated_at' => now()]
        );

        return response()->json([
            'status' => 'ok',
            'need_phone' => empty($user->phone_number)
        ]);
    }

    // Telefon raqam saqlash
    public function savePhone(Request $request)
    {
        $request->validate([
            'telegram_id' => 'required|integer',
            'phone_number' => 'required|string'
        ]);

        $user = User::findOrFail($request->telegram_id);

        $user->update([
            'phone_number' => $request->phone_number
        ]);

        return response()->json([
            'status' => 'saved'
        ]);
    }
}
