<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\MlProduct;
use Inertia\Inertia;
use Illuminate\Http\Request;

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
        return Inertia::render('User/Mlegends', [
            'products' => MlProduct::orderByDesc('id')->get()
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
