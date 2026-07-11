<?php

namespace App\Console\Commands;

use App\Models\CurrencyRate;
use App\Models\SekaliProduct;
use App\Services\SekaliPayService;
use Illuminate\Console\Command;

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

        $this->info("Tugadi: {$synced} mahsulot yangilandi, {$created} yangi qo'shildi.");
        return 0;
    }

    private function getIdrRate(): float
    {
        $rate = CurrencyRate::where('currency_code', 'IDR')
            ->orderByDesc('created_at')
            ->value('rate_to_base');

        return (float) ($rate ?? 0);
    }
}
