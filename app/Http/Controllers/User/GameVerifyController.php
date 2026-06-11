<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class GameVerifyController extends Controller
{
    public function verifyPubg(Request $request)
    {
        $request->validate(['id' => 'required|string|max:50']);

        $response = Http::withHeaders([
            'x-rapidapi-key'  => config('services.rapidapi.key'),
            'x-rapidapi-host' => 'check-id-game1.p.rapidapi.com',
        ])->get('https://check-id-game1.p.rapidapi.com/api/game/pubg-mobile-global-vc', [
            'id' => $request->input('id'),
        ]);

        if (!$response->successful()) {
            return response()->json(['username' => null], 200);
        }

        $data = $response->json();
        $username = $data['data']['username']
            ?? $data['data']['name']
            ?? $data['data']['nickname']
            ?? $data['data']['playerName']
            ?? $data['name']
            ?? $data['username']
            ?? $data['nickname']
            ?? null;

        return response()->json(['username' => $username]);
    }

    public function verifyMlegends(Request $request)
    {
        $request->validate([
            'id'   => 'required|string|max:50',
            'zone' => 'required|string|max:50',
        ]);

        $response = Http::withHeaders([
            'x-rapidapi-key'  => config('services.rapidapi.key'),
            'x-rapidapi-host' => 'check-id-game1.p.rapidapi.com',
        ])->get('https://check-id-game1.p.rapidapi.com/api/game/cek-region-mlbb-m', [
            'id'   => $request->input('id'),
            'zone' => $request->input('zone'),
        ]);

        if (!$response->successful()) {
            return response()->json(['username' => null], 200);
        }

        $data = $response->json();
        $username = $data['data']['username']
            ?? $data['data']['name']
            ?? $data['data']['nickname']
            ?? $data['username']
            ?? $data['name']
            ?? $data['nickname']
            ?? null;

        return response()->json(['username' => $username]);
    }
}
