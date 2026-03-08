<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Password;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;


class PasswordController extends Controller
{
    public function store(Request $request)
{
    $data = $request->validate([
        'id' => ['required', 'exists:users,id'],
        'password' => ['required', 'min:8'],
    ]);

    Password::create([
        'user_id' => $data['id'],
        'password' => Hash::make($data['password']),
    ]);

    return response()->json([
        'success' => true
    ]);
}
    public function update(Request $request, $userId)
    {
        $data = $request->validate([
            'password' => ['required', 'min:6'],
        ]);

        $password = Password::where('user_id', $userId)->first();

        if (!$password) {
            return response()->json([
                'message' => 'Password topilmadi'
            ], 404);
        }

        $password->update([
            'password' => Hash::make($data['password'])
        ]);

        return response()->json([
            'success' => true
        ]);
    }
}
