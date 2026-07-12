<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\SekaliOrder;
use App\Models\SekaliProduct;
use App\Services\SekaliPayService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Inertia\Inertia;

class SekaliShopController extends Controller
{
    public function index()
    {
        // category → game structure with one representative image per game
        $rows = SekaliProduct::where('is_active', true)
            ->select('category', 'game_name', 'image_url')
            ->orderBy('category')
            ->orderBy('game_name')
            ->get();

        // Unique games per category, keeping first image_url found
        $categories = $rows
            ->groupBy('category')
            ->map(fn($group) =>
                $group->groupBy('game_name')
                    ->map(fn($games) => [
                        'name'      => $games->first()->game_name,
                        'image_url' => $games->first(fn($g) => $g->image_url)?->image_url,
                    ])
                    ->values()
            );

        return Inertia::render('User/SekaliShop', [
            'categories' => $categories,
        ]);
    }

    public function variants(Request $request)
    {
        $request->validate([
            'category' => 'required|string',
            'game'     => 'required|string',
        ]);

        $products = SekaliProduct::where('is_active', true)
            ->where('category', $request->category)
            ->where('game_name', $request->game)
            ->orderBy('product_type')
            ->orderBy('price_uzs')
            ->get([
                'id', 'category', 'game_name', 'product_type', 'image_url', 'name',
                'price_uzs', 'order_process', 'has_validation',
                'required_fields', 'stock',
            ]);

        // Group by product_type
        $grouped = $products
            ->groupBy(fn($p) => $p->product_type ?? 'Standard')
            ->map(fn($items) => $items->values());

        return response()->json([
            'grouped' => $grouped,
            'types'   => $grouped->keys()->values(),
        ]);
    }

    public function search(Request $request)
    {
    $request->validate([
        'q' => 'required|string|min:1|max:100',
    ]);

    $q = $request->q;

    $rows = SekaliProduct::where('is_active', true)
        ->where('game_name', 'like', "%{$q}%")
        ->select('category', 'game_name', 'image_url')
        ->orderBy('game_name')
        ->limit(100)
        ->get();

    // Same "unique game per category, first image found" grouping as index()
    $results = $rows
        ->groupBy(fn ($p) => $p->category . '|' . $p->game_name)
        ->map(fn ($group) => [
            'category'  => $group->first()->category,
            'name'      => $group->first()->game_name,
            'image_url' => $group->first(fn ($g) => $g->image_url)?->image_url,
        ])
        ->values()
        ->take(10);

    return response()->json(['results' => $results]);
    }

    public function validate(Request $request, SekaliPayService $api)
    {
        $data = $request->validate([
            'product_id' => 'required|integer|exists:sekali_products,id',
            'target'     => 'required|string|max:200',
            'zone_id'    => 'nullable|string|max:100',
        ]);

        $product = SekaliProduct::where('id', $data['product_id'])
            ->where('is_active', true)
            ->firstOrFail();

        if (!$product->has_validation) {
            return response()->json(['success' => true, 'name' => null]);
        }

        $result = $api->validateAccount($product->sekali_item_id, $data['target'], $data['zone_id'] ?? null);

        if (!$result['success']) {
            return response()->json(['success' => false, 'message' => 'Akkaunt topilmadi'], 422);
        }

        return response()->json([
            'success' => true,
            'name'    => $result['data']['name'] ?? $result['data']['username'] ?? null,
        ]);
    }

    public function order(Request $request, SekaliPayService $api)
    {
        $data = $request->validate([
            'product_id' => 'required|integer|exists:sekali_products,id',
            'target'     => 'required|string|max:200',
            'zone_id'    => 'nullable|string|max:100',
        ]);

        $userId  = auth()->id();
        $product = SekaliProduct::where('id', $data['product_id'])
            ->where('is_active', true)
            ->firstOrFail();

        $priceUzs = $product->price_uzs;

        $deducted = false;
        DB::transaction(function () use ($userId, $priceUzs, &$deducted) {
            $balance = DB::table('user_balances')
                ->where('user_id', $userId)
                ->lockForUpdate()
                ->first();

            if (!$balance || (float) $balance->balance < $priceUzs) {
                return;
            }

            DB::table('user_balances')
                ->where('user_id', $userId)
                ->update(['balance' => DB::raw("balance - {$priceUzs}"), 'updated_at' => now()]);

            $deducted = true;
        });

        if (!$deducted) {
            return back()->withErrors(['balance' => 'Balansingiz yetarli emas']);
        }

        $refId = (string) Str::uuid();

        $order = SekaliOrder::create([
            'ref_id'            => $refId,
            'user_id'           => $userId,
            'sekali_product_id' => $product->id,
            'game_target'       => $data['target'],
            'zone_id'           => $data['zone_id'] ?? null,
            'quantity'          => 1,
            'price_uzs'         => $priceUzs,
            'price_idr'         => $product->price_idr,
            'status'            => 'pending',
        ]);

        $result = $api->createTransaction(
            $refId,
            $product->sekali_item_id,
            $data['target'],
            $data['zone_id'] ?? null
        );

        if (!$result['success']) {
            DB::table('user_balances')
                ->where('user_id', $userId)
                ->increment('balance', $priceUzs);

            $order->update(['status' => 'failed', 'notes' => $result['message']]);
            Log::error("SekaliPay order failed: {$result['message']}", ['ref_id' => $refId]);

            return back()->withErrors(['api' => 'Buyurtma yuborishda xatolik. Balans qaytarildi.']);
        }

        $order->update([
            'status'         => 'processing',
            'sekali_invoice' => $result['data']['invoice'] ?? null,
        ]);

        return redirect()->route('user-purchases.index')
            ->with('success', "Buyurtma qabul qilindi! #{$refId}");
    }
}
