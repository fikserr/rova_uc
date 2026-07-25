<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\SekaliOrder;
use App\Models\SekaliProduct;
use App\Models\UcBundle;
use App\Models\UcProduct;
use App\Services\SekaliPayService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class SekaliShopController extends Controller
{
    public function index()
    {
        $isReseller = auth()->user()?->role === 'reseller';

        // category → game structure with one representative image per game
        $rows = SekaliProduct::where('is_active', true)
            ->where($isReseller ? 'visible_to_resellers' : 'visible_to_users', true)
            ->select('category', 'game_name', 'image_url', 'view_count')
            ->orderBy('category')
            ->orderBy('game_name')
            ->get();

        // Unique games per category, keeping first image_url found
        $categories = $rows
            ->groupBy('category')
            ->map(fn($group) =>
                $group->groupBy('game_name')
                    ->map(fn($games) => [
                        'name'       => $games->first()->game_name,
                        'image_url'  => $games->first(fn($g) => $g->image_url)?->image_url,
                        'view_count' => $games->max('view_count'),
                    ])
                    ->values()
            );

        $userId = auth()->id();
        $lastPubgAccount = $userId
            ? DB::table('pubg_accounts')->where('user_id', $userId)->orderByDesc('id')->first(['pubg_player_id', 'pubg_name'])
            : null;

        $bundles = UcBundle::where('is_active', true)
            ->where($isReseller ? 'visible_to_resellers' : 'visible_to_users', true)
            ->orderBy('sort_order')->orderByDesc('id')->get()
            ->map(fn($b) => array_merge($b->toArray(), [
                'image_url' => $b->image_path ? Storage::disk('public')->url($b->image_path) : null,
            ]));

        $ucProducts = UcProduct::where('is_active', true)
            ->where($isReseller ? 'visible_to_resellers' : 'visible_to_users', true)
            ->orderBy('sell_price')->get()
            ->map(fn($p) => array_merge($p->toArray(), [
                'sell_price'       => ($isReseller && $p->reseller_price) ? $p->reseller_price : $p->sell_price,
                'is_reseller_price'=> $isReseller && $p->reseller_price,
            ]));

        return Inertia::render('User/SekaliShop', [
            'categories'      => $categories,
            'ucProducts'      => $ucProducts,
            'bundles'         => $bundles,
            'lastPubgAccount' => $lastPubgAccount,
            'isReseller'      => $isReseller,
        ]);
    }

    public function variants(Request $request)
    {
        $request->validate([
            'category' => 'required|string',
            'game'     => 'required|string',
        ]);

        // Increment view count whenever a user loads a specific game's variants
        DB::table('sekali_products')
            ->where('category', $request->category)
            ->where('game_name', $request->game)
            ->where('is_active', true)
            ->increment('view_count');

        $isReseller = auth()->user()?->role === 'reseller';

        $products = SekaliProduct::where('is_active', true)
            ->where($isReseller ? 'visible_to_resellers' : 'visible_to_users', true)
            ->where('category', $request->category)
            ->where('game_name', $request->game)
            ->orderBy('product_type')
            ->orderBy('price_uzs')
            ->get([
                'id', 'category', 'game_name', 'product_type', 'image_url', 'name',
                'price_uzs', 'reseller_price_uzs', 'order_process', 'has_validation',
                'required_fields', 'stock',
            ])
            ->map(function ($p) use ($isReseller) {
                $arr = $p->toArray();
                $arr['display_price'] = ($isReseller && $p->reseller_price_uzs)
                    ? $p->reseller_price_uzs
                    : $p->price_uzs;
                $arr['is_reseller_price'] = $isReseller && $p->reseller_price_uzs;
                return $arr;
            });

        $grouped = collect($products)
            ->groupBy(fn($p) => $p['product_type'] ?? 'Standard')
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
        $isReseller = auth()->user()?->role === 'reseller';

        $rows = SekaliProduct::where('is_active', true)
            ->where($isReseller ? 'visible_to_resellers' : 'visible_to_users', true)
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

        $gameName = strtolower($product->game_name ?? '');
        $target   = $data['target'];
        $zoneId   = $data['zone_id'] ?? null;

        // 1. SekalıPay validation (confirms account exists)
        if ($product->has_validation) {
            $result = $api->validateAccount($product->sekali_item_id, $target, $zoneId);

            if (!$result['success']) {
                return response()->json(['success' => false, 'message' => 'Akkaunt topilmadi'], 422);
            }

            // Try to extract username from SekalıPay response
            $d    = $result['data'];
            $name = null;
            foreach (['display_name', 'displayName', 'account_name', 'name', 'username',
                      'nickname', 'playerName', 'player_name', 'char_name', 'user_name', 'charName'] as $field) {
                if (!empty($d[$field]) && is_string($d[$field])) {
                    $name = $d[$field];
                    break;
                }
            }

            // 2. If SekalıPay returned no username, try game-specific RapidAPI
            if (!$name) {
                $name = $this->fetchUsernameViaRapidApi($gameName, $target, $zoneId);
            }

            return response()->json(['success' => true, 'name' => $name]);
        }

        // No SekalıPay validation — still try RapidAPI for known games
        $name = $this->fetchUsernameViaRapidApi($gameName, $target, $zoneId);

        return response()->json(['success' => true, 'name' => $name]);
    }

    private function fetchUsernameViaRapidApi(string $gameName, string $target, ?string $zoneId): ?string
    {
        $rapidKey = config('services.rapidapi.key');
        if (!$rapidKey) return null;

        $headers = [
            'x-rapidapi-key'  => $rapidKey,
            'x-rapidapi-host' => 'check-id-game1.p.rapidapi.com',
        ];

        try {
            if (str_contains($gameName, 'pubg')) {
                $res  = Http::withHeaders($headers)->timeout(10)
                    ->get('https://check-id-game1.p.rapidapi.com/api/game/pubg-mobile-global-vc', ['id' => $target]);
                $json = $res->json();
            } elseif (str_contains($gameName, 'legend') || str_contains($gameName, 'mlbb') || str_contains($gameName, 'mobile legend')) {
                if (!$zoneId) return null;
                $res  = Http::withHeaders($headers)->timeout(10)
                    ->get('https://check-id-game1.p.rapidapi.com/api/game/cek-region-mlbb-m', ['id' => $target, 'zone' => $zoneId]);
                $json = $res->json();
            } else {
                return null;
            }

            $d = $json['data'] ?? $json;
            foreach (['username', 'name', 'nickname', 'playerName'] as $field) {
                if (!empty($d[$field]) && is_string($d[$field])) {
                    return $d[$field];
                }
            }
        } catch (\Throwable $e) {
            Log::warning('RapidAPI username fetch failed', ['game' => $gameName, 'error' => $e->getMessage()]);
        }

        return null;
    }

    public function order(Request $request, SekaliPayService $api)
    {
        $data = $request->validate([
            'product_id' => 'required|integer|exists:sekali_products,id',
            'target'     => 'required|string|max:200',
            'zone_id'    => 'nullable|string|max:100',
        ]);

        $userId  = auth()->id();
        $user    = auth()->user();
        $product = SekaliProduct::where('id', $data['product_id'])
            ->where('is_active', true)
            ->firstOrFail();

        $isReseller = $user->role === 'reseller';
        $priceUzs   = ($isReseller && $product->reseller_price_uzs)
            ? $product->reseller_price_uzs
            : $product->price_uzs;

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
            'ref_id'             => $refId,
            'user_id'            => $userId,
            'sekali_product_id'  => $product->id,
            'game_target'        => $data['target'],
            'zone_id'            => $data['zone_id'] ?? null,
            'quantity'           => 1,
            'price_uzs'          => $priceUzs,
            'regular_price_uzs'  => $isReseller ? $product->price_uzs : null,
            'price_idr'          => $product->price_idr,
            'status'             => 'pending',
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

            $userMsg = str_contains(strtoupper($result['message']), 'UNAVAILABLE')
                ? 'Mahsulot vaqtincha mavjud emas. Keyinroq urinib ko\'ring. Balans qaytarildi.'
                : 'Buyurtma yuborishda xatolik. Balans qaytarildi.';

            return back()->withErrors(['api' => $userMsg]);
        }

        $order->update([
            'status'         => 'processing',
            'sekali_invoice' => $result['data']['invoice'] ?? null,
        ]);

        return redirect()->route('user-purchases.index')
            ->with('success', "Buyurtma qabul qilindi! #{$refId}");
    }
}
