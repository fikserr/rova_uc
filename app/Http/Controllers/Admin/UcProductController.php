<?php

// app/Http/Controllers/Admin/UcProductController.php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\UcProduct;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class UcProductController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/UcProducts', [
            'products' => UcProduct::orderBy('id', 'desc')->get(),
        ]);
    }
    public function userIndex()
    {
        $userId = auth()->id();
        $lastPubgAccount = null;

        if ($userId) {
            $lastPubgAccount = DB::table('pubg_accounts')
                ->where('user_id', $userId)
                ->orderByDesc('id')
                ->first(['pubg_player_id', 'pubg_name']);
        }

        return Inertia::render('User/UcShop', [
            'products' => UcProduct::orderBy('id', 'desc')->get(),
            'lastPubgAccount' => $lastPubgAccount,
        ]);
    }
    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => 'required|string',
            'uc_amount' => 'required|integer',
            'sell_price' => 'required|numeric',
            'cost_price' => 'required|numeric',
            'cost_currency' => 'required|string',
        ]);

        UcProduct::create([
            ...$data,
            'sell_currency' => 'UZS',
            'is_active' => true,
            'created_at' => now(),
        ]);

        return redirect()->back()->with('success', 'UC mahsulot qo‘shildi');
    }
    public function update(Request $request, UcProduct $product)
    {
        $data = $request->validate([
            'title' => 'required|string',
            'uc_amount' => 'required|integer',
            'sell_price' => 'required|numeric',
            'cost_price' => 'required|numeric',
            'cost_currency' => 'required|string',
            'is_active' => 'boolean',
        ]);

        $product->update($data);

        return redirect()->back()->with('success', 'UC mahsulot yangilandi');
    }
    public function destroy(UcProduct $product)
    {
        $product->delete();

        return redirect()->back()->with('success', 'UC mahsulot o‘chirildi');
    }
}
