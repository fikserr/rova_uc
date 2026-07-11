<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CurrencyRate;
use App\Models\SekaliProduct;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Inertia\Inertia;

class SekaliProductController extends Controller
{
    public function index()
    {
        // Only category → game structure for initial load
        $rows = SekaliProduct::select('category', 'game_name')
            ->distinct()
            ->orderBy('category')
            ->orderBy('game_name')
            ->get();

        $tree = $rows
            ->groupBy('category')
            ->map(fn($g) => $g->pluck('game_name')->unique()->values());

        $idrRate = (float) (CurrencyRate::where('currency_code', 'IDR')
            ->orderByDesc('created_at')
            ->value('rate_to_base') ?? 0);

        return Inertia::render('Admin/SekaliProducts', [
            'tree'     => $tree,
            'idr_rate' => $idrRate,
        ]);
    }

    public function variants(Request $request)
    {
        $request->validate([
            'category' => 'required|string',
            'game'     => 'required|string',
        ]);

        $products = SekaliProduct::where('category', $request->category)
            ->where('game_name', $request->game)
            ->orderBy('product_type')
            ->orderBy('price_uzs')
            ->get([
                'id', 'category', 'game_name', 'product_type', 'name',
                'price_idr', 'price_uzs', 'markup_percent',
                'order_process', 'has_validation', 'stock', 'is_active',
            ]);

        $grouped = $products
            ->groupBy(fn($p) => $p->product_type ?? 'Standard')
            ->map(fn($items) => $items->values());

        return response()->json([
            'grouped' => $grouped,
            'types'   => $grouped->keys()->values(),
            'total'   => $products->count(),
        ]);
    }

    public function update(Request $request, SekaliProduct $sekaliProduct)
    {
        $data = $request->validate([
            'price_uzs' => 'required|integer|min:100',
            'is_active' => 'required|boolean',
        ]);

        $idrRate = (float) (CurrencyRate::where('currency_code', 'IDR')
            ->orderByDesc('created_at')
            ->value('rate_to_base') ?? 0);

        $sekaliProduct->price_uzs = $data['price_uzs'];
        $sekaliProduct->is_active = $data['is_active'];

        if ($idrRate > 0 && $sekaliProduct->price_idr > 0) {
            $costUzs = $sekaliProduct->price_idr * $idrRate;
            $sekaliProduct->markup_percent = round(
                (($data['price_uzs'] - $costUzs) / $costUzs) * 100, 2
            );
        }

        $sekaliProduct->save();

        return response()->json(['ok' => true, 'product' => $sekaliProduct->only([
            'id', 'price_uzs', 'markup_percent', 'is_active',
        ])]);
    }

    public function bulkMarkup(Request $request)
    {
        $data = $request->validate([
            'markup_percent' => 'required|numeric|min:0|max:500',
            'category'       => 'nullable|string',
            'game'           => 'nullable|string',
            'product_type'   => 'nullable|string',
        ]);

        $idrRate = (float) (CurrencyRate::where('currency_code', 'IDR')
            ->orderByDesc('created_at')
            ->value('rate_to_base') ?? 0);

        if ($idrRate <= 0) {
            return response()->json(['error' => 'IDR kursi kiritilmagan'], 422);
        }

        $query = SekaliProduct::query();
        if (!empty($data['category']))     $query->where('category', $data['category']);
        if (!empty($data['game']))         $query->where('game_name', $data['game']);
        if (!empty($data['product_type'])) $query->where('product_type', $data['product_type']);

        $count = 0;
        foreach ($query->get() as $product) {
            $product->markup_percent = $data['markup_percent'];
            $product->price_uzs = (int) ceil(
                $product->price_idr * $idrRate * (1 + $data['markup_percent'] / 100)
            );
            $product->save();
            $count++;
        }

        return response()->json(['ok' => true, 'count' => $count]);
    }

    public function sync()
    {
        Artisan::call('sekali:sync');
        $output = Artisan::output();
        return redirect()->back()->with('success', 'Sync tugadi: ' . trim($output));
    }
}
