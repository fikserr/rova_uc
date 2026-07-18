<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CurrencyRate;
use App\Models\SekaliProduct;
use App\Models\TopGame;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class SekaliProductController extends Controller
{
    public function index()
    {
        // category → game structure
        $rows = SekaliProduct::select('category', 'game_name')
            ->distinct()
            ->orderBy('category')
            ->orderBy('game_name')
            ->get();

        $tree = $rows
            ->groupBy('category')
            ->map(fn($g) => $g->pluck('game_name')->unique()->values());

        // Per-game visibility: if ALL products visible → true, else false
        $visRows = DB::table('sekali_products')
            ->select('category', 'game_name',
                DB::raw('MIN(CAST(visible_to_users AS UNSIGNED)) as users'),
                DB::raw('MIN(CAST(visible_to_resellers AS UNSIGNED)) as resellers')
            )
            ->groupBy('category', 'game_name')
            ->get();

        $gameVisibility = [];
        foreach ($visRows as $r) {
            $gameVisibility[$r->category][$r->game_name] = [
                'users'     => (bool) $r->users,
                'resellers' => (bool) $r->resellers,
            ];
        }

        $idrRate = (float) (CurrencyRate::where('currency_code', 'IDR')
            ->orderByDesc('created_at')
            ->value('rate_to_base') ?? 0);

        $topGames = TopGame::orderBy('sort_order')->pluck('game_name')->toArray();

        return Inertia::render('Admin/SekaliProducts', [
            'tree'            => $tree,
            'idr_rate'        => $idrRate,
            'top_games'       => $topGames,
            'game_visibility' => $gameVisibility,
        ]);
    }

    public function gameVisibilityToggle(Request $request)
    {
        $data = $request->validate([
            'category'     => 'required|string',
            'game_name'    => 'required|string',
            'product_type' => 'nullable|string',
            'field'        => 'required|in:visible_to_users,visible_to_resellers',
            'value'        => 'required|boolean',
        ]);

        $query = SekaliProduct::where('category', $data['category'])
            ->where('game_name', $data['game_name']);

        if (!empty($data['product_type'])) {
            $typeVal = $data['product_type'] === 'Standard' ? null : $data['product_type'];
            $query->where('product_type', $typeVal);
        }

        $query->update([$data['field'] => $data['value']]);

        return response()->json(['ok' => true]);
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
                'price_idr', 'price_uzs', 'reseller_price_uzs', 'markup_percent',
                'order_process', 'has_validation', 'stock',
                'is_active', 'visible_to_users', 'visible_to_resellers',
            ]);

        $grouped = $products
            ->groupBy(fn($p) => $p->product_type ?? 'Standard')
            ->map(fn($items) => $items->values());

        // Per-type visibility aggregate (MIN = all must be true for type to show as visible)
        $typeVisibility = $products
            ->groupBy(fn($p) => $p->product_type ?? 'Standard')
            ->map(fn($items) => [
                'users'     => $items->every(fn($p) => $p->visible_to_users),
                'resellers' => $items->every(fn($p) => $p->visible_to_resellers),
            ]);

        return response()->json([
            'grouped'         => $grouped,
            'types'           => $grouped->keys()->values(),
            'total'           => $products->count(),
            'type_visibility' => $typeVisibility,
        ]);
    }

    public function update(Request $request, SekaliProduct $sekaliProduct)
    {
        $data = $request->validate([
            'price_uzs'            => 'required|integer|min:100',
            'reseller_price_uzs'   => 'nullable|integer|min:100',
            'is_active'            => 'required|boolean',
            'visible_to_users'     => 'required|boolean',
            'visible_to_resellers' => 'required|boolean',
        ]);

        $idrRate = (float) (CurrencyRate::where('currency_code', 'IDR')
            ->orderByDesc('created_at')
            ->value('rate_to_base') ?? 0);

        $sekaliProduct->price_uzs            = $data['price_uzs'];
        $sekaliProduct->reseller_price_uzs   = $data['reseller_price_uzs'] ?? null;
        $sekaliProduct->is_active            = $data['is_active'];
        $sekaliProduct->visible_to_users     = $data['visible_to_users'];
        $sekaliProduct->visible_to_resellers = $data['visible_to_resellers'];

        if ($idrRate > 0 && $sekaliProduct->price_idr > 0) {
            $costUzs = $sekaliProduct->price_idr * $idrRate;
            $sekaliProduct->markup_percent = round(
                (($data['price_uzs'] - $costUzs) / $costUzs) * 100, 2
            );
        }

        $sekaliProduct->save();

        return response()->json(['ok' => true, 'product' => $sekaliProduct->only([
            'id', 'price_uzs', 'reseller_price_uzs', 'markup_percent',
            'is_active', 'visible_to_users', 'visible_to_resellers',
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

    public function toggleTopGame(Request $request)
    {
        $data = $request->validate([
            'category'  => 'required|string',
            'game_name' => 'required|string',
        ]);

        $existing = TopGame::where('category', $data['category'])
            ->where('game_name', $data['game_name'])
            ->first();

        if ($existing) {
            $existing->delete();
            return response()->json(['is_top' => false]);
        }

        $imageUrl = SekaliProduct::where('category', $data['category'])
            ->where('game_name', $data['game_name'])
            ->whereNotNull('image_url')
            ->value('image_url');

        TopGame::create([
            'category'   => $data['category'],
            'game_name'  => $data['game_name'],
            'image_url'  => $imageUrl,
            'sort_order' => (TopGame::max('sort_order') ?? 0) + 1,
        ]);

        return response()->json(['is_top' => true]);
    }

    public function sync()
    {
        Artisan::call('sekali:sync');
        $output = Artisan::output();
        return redirect()->back()->with('success', 'Sync tugadi: ' . trim($output));
    }
}
