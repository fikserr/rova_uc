<?php

namespace App\Http\Controllers\Reseller;

use App\Http\Controllers\Controller;
use App\Models\SekaliOrder;
use App\Models\SekaliProduct;
use App\Services\SekaliPayService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Inertia\Inertia;

class ResellerShopController extends Controller
{
    public function index()
    {
        $rows = SekaliProduct::where('is_active', true)
            ->where('visible_to_resellers', true)
            ->whereNotNull('reseller_price_uzs')
            ->select('category', 'game_name', 'image_url')
            ->orderBy('category')
            ->orderBy('game_name')
            ->get();

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

        $balance = (float) DB::table('user_balances')
            ->where('user_id', auth()->id())
            ->value('balance') ?? 0;

        return Inertia::render('Reseller/Shop', [
            'categories' => $categories,
            'balance'    => $balance,
        ]);
    }

    public function variants(Request $request)
    {
        $request->validate([
            'category' => 'required|string',
            'game'     => 'required|string',
        ]);

        $products = SekaliProduct::where('is_active', true)
            ->where('visible_to_resellers', true)
            ->where('category', $request->category)
            ->where('game_name', $request->game)
            ->whereNotNull('reseller_price_uzs')
            ->orderBy('product_type')
            ->orderBy('reseller_price_uzs')
            ->get([
                'id', 'category', 'game_name', 'product_type', 'image_url', 'name',
                'price_uzs', 'reseller_price_uzs', 'has_validation', 'required_fields', 'stock',
            ])
            ->map(fn($p) => array_merge($p->toArray(), [
                'display_price'     => (float) $p->reseller_price_uzs,
                'is_reseller_price' => true,
            ]));

        $grouped = $products
            ->groupBy(fn($p) => $p['product_type'] ?? 'Standard')
            ->map(fn($items) => $items->values());

        return response()->json([
            'grouped' => $grouped,
            'types'   => $grouped->keys()->values(),
        ]);
    }

    public function validateAccount(Request $request, SekaliPayService $api)
    {
        $data = $request->validate([
            'product_id' => 'required|integer|exists:sekali_products,id',
            'target'     => 'required|string|max:200',
            'zone_id'    => 'nullable|string|max:100',
        ]);

        $product = SekaliProduct::where('id', $data['product_id'])
            ->where('is_active', true)
            ->whereNotNull('reseller_price_uzs')
            ->firstOrFail();

        if ($product->has_validation) {
            $result = $api->validateAccount($product->sekali_item_id, $data['target'], $data['zone_id'] ?? null);

            if (!$result['success']) {
                return response()->json(['success' => false, 'message' => 'Akkaunt topilmadi'], 422);
            }

            $d    = $result['data'];
            $name = null;
            foreach (['name', 'username', 'nickname', 'playerName', 'player_name',
                      'char_name', 'user_name', 'charName', 'display_name', 'displayName'] as $field) {
                if (!empty($d[$field]) && is_string($d[$field])) {
                    $name = $d[$field];
                    break;
                }
            }

            return response()->json(['success' => true, 'name' => $name]);
        }

        return response()->json(['success' => true, 'name' => null]);
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
            ->whereNotNull('reseller_price_uzs')
            ->firstOrFail();

        $priceUzs = (float) $product->reseller_price_uzs;
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
            'regular_price_uzs' => $product->price_uzs,
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
            Log::error("SekaliPay reseller order failed: {$result['message']}", ['ref_id' => $refId]);

            return back()->withErrors(['api' => 'Buyurtma yuborishda xatolik. Balans qaytarildi.']);
        }

        $order->update([
            'status'         => 'processing',
            'sekali_invoice' => $result['data']['invoice'] ?? null,
        ]);

        return redirect()->route('reseller.dashboard')
            ->with('success', "Buyurtma qabul qilindi! #{$refId}");
    }
}
