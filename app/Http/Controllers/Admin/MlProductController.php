<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\MlProduct;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MlProductController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/MlProducts', [
            'products' => MlProduct::orderByDesc('id')->get()
        ]);
    }
    public function userIndex()
    {
        $userId = auth()->id();
        $lastMlAccount = null;

        if ($userId) {
            $lastMlAccount = DB::table('ml_accounts')
                ->where('user_id', $userId)
                ->orderByDesc('id')
                ->first(['ml_account_id', 'ml_server_id']);
        }

        return Inertia::render('User/Mlegends', [
            'products' => MlProduct::orderByDesc('id')->get(),
            'lastMlAccount' => $lastMlAccount,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title'         => 'required|string',
            'diamonds'      => 'required|integer',
            'sell_price'    => 'required|numeric',
            'cost_price'    => 'required|numeric',
            'cost_currency' => 'required|string',
        ]);

        MlProduct::create([
            ...$data,
            'sell_currency' => 'UZS',
            'is_active'     => true,
            'created_at'    => now(),
        ]);

        return back()->with('success', 'ML product qo‘shildi');
    }

    public function update(Request $request, MlProduct $product)
    {
        $data = $request->validate([
            'title'         => 'required|string',
            'diamonds'      => 'required|integer',
            'sell_price'    => 'required|numeric',
            'cost_price'    => 'required|numeric',
            'cost_currency' => 'required|string',
            'is_active'     => 'boolean',
        ]);

        $product->update($data);

        return back()->with('success', 'ML product yangilandi');
    }

    public function destroy(MlProduct $product)
    {
        $product->delete();
        return back()->with('success', 'ML product o‘chirildi');
    }
}
