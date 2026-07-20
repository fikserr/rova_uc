<?php

namespace App\Console\Commands;

use App\Models\CurrencyRate;
use App\Models\SekaliProduct;
use App\Models\TopGame;
use App\Services\SekaliPayService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;

class SekaliSync extends Command
{
    protected $signature   = 'sekali:sync {--markup= : Default markup percent (overrides .env)}';
    protected $description = 'SekalıPay mahsulot katalogini yangilash';

    public function handle(SekaliPayService $api): int
    {
        $this->info('SekalıPay sync boshlandi...');

        $idrRate = $this->getIdrRate();
        if ($idrRate <= 0) {
            $this->error('IDR kursi topilmadi. Admin panelda IDR kursini kiriting.');
            return 1;
        }

        $defaultMarkup = (float) ($this->option('markup') ?? config('services.sekalipay.default_markup', 20));
        $this->info("IDR kursi: {$idrRate} UZS | Ustama: {$defaultMarkup}%");

        $page     = 1;
        $lastPage = 1;
        $synced   = 0;
        $created  = 0;

        do {
            $result   = $api->getItems(['page' => $page, 'per_page' => 100]);
            $categories = $result['data'] ?? [];
            $meta       = $result['meta'] ?? null;

            if ($meta && isset($meta['last_page'])) {
                $lastPage = (int) $meta['last_page'];
            }

            if (empty($categories)) {
                break;
            }

            $this->info("Sahifa {$page}/{$lastPage} — " . count($categories) . " kategoriya...");

            foreach ($categories as $category) {
                $categoryName = $category['name'] ?? 'Other';

                foreach ($category['products'] ?? [] as $product) {
                    $gameName = $product['name'] ?? '';
                    $imageUrl = $this->localizeImage($product['image'] ?? null);

                    foreach ($product['variants'] ?? [] as $variant) {
                        $itemId = (int) ($variant['id'] ?? 0);
                        if (!$itemId) continue;

                        if (($variant['status'] ?? 'on') !== 'on') continue;

                        $priceIdr       = (int) ($variant['price'] ?? 0);
                        $hasValidation  = !empty($variant['validation']['available']);
                        $requiredFields = $variant['required_fields'] ?? null;

                        $existingMarkup = SekaliProduct::where('sekali_item_id', $itemId)
                            ->value('markup_percent') ?? $defaultMarkup;

                        $priceUzs = (int) ceil($priceIdr * $idrRate * (1 + $existingMarkup / 100));
                        $isNew    = !SekaliProduct::where('sekali_item_id', $itemId)->exists();

                        $productType = $variant['product_type']['name'] ?? null;

                        SekaliProduct::updateOrCreate(
                            ['sekali_item_id' => $itemId],
                            [
                                'sekali_sku'      => $variant['sku'] ?? null,
                                'category'        => $categoryName,
                                'game_name'       => $gameName,
                                'product_type'    => $productType,
                                'image_url'       => $imageUrl,
                                'name'            => $variant['name'] ?? '',
                                'price_idr'       => $priceIdr,
                                'price_uzs'       => $priceUzs,
                                'markup_percent'  => $isNew ? $defaultMarkup : $existingMarkup,
                                'order_process'   => $variant['order_process'] ?? 'auto',
                                'required_fields' => $requiredFields ? json_encode($requiredFields) : null,
                                'has_validation'  => $hasValidation,
                                'stock'           => (int) ($variant['stock'] ?? -1),
                                'synced_at'       => now(),
                            ]
                        );

                        $synced++;
                        if ($isNew) $created++;
                    }
                }
            }

            $page++;
        } while ($page <= $lastPage);

        // top_games.image_url ni ham local URL ga yangilash
        $this->syncTopGameImages();

        $this->info("Tugadi: {$synced} mahsulot yangilandi, {$created} yangi qo'shildi.");
        return 0;
    }

    private function localizeImage(?string $url): ?string
    {
        if (!$url) return null;
        if (str_starts_with($url, '/storage/')) return $url; // already local

        $hash = md5($url);
        $dir  = storage_path('app/public/sekali-images');

        // Already downloaded?
        foreach (['png', 'jpg', 'webp', 'gif'] as $ext) {
            if (file_exists("{$dir}/{$hash}.{$ext}")) {
                return "/storage/sekali-images/{$hash}.{$ext}";
            }
        }

        try {
            $res = Http::timeout(15)->withHeaders([
                'User-Agent' => 'Mozilla/5.0',
            ])->get($url);

            if (!$res->ok() || strlen($res->body()) < 64) return $url;

            $type = trim(explode(';', $res->header('Content-Type') ?? 'image/jpeg')[0]);
            $ext  = match(true) {
                str_contains($type, 'png')  => 'png',
                str_contains($type, 'webp') => 'webp',
                str_contains($type, 'gif')  => 'gif',
                default                     => 'jpg',
            };

            if (!is_dir($dir)) mkdir($dir, 0775, true);
            file_put_contents("{$dir}/{$hash}.{$ext}", $res->body());

            return "/storage/sekali-images/{$hash}.{$ext}";
        } catch (\Throwable) {
            return $url; // fallback: keep original
        }
    }

    private function syncTopGameImages(): void
    {
        TopGame::all()->each(function (TopGame $tg) {
            $localUrl = SekaliProduct::where('game_name', $tg->game_name)
                ->where('category', $tg->category)
                ->whereNotNull('image_url')
                ->value('image_url');

            if ($localUrl && $tg->image_url !== $localUrl) {
                $tg->update(['image_url' => $localUrl]);
            }
        });
    }

    private function getIdrRate(): float
    {
        $rate = CurrencyRate::where('currency_code', 'IDR')
            ->orderByDesc('created_at')
            ->value('rate_to_base');

        return (float) ($rate ?? 0);
    }
}
