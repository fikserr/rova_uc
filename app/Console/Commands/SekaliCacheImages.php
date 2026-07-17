<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

class SekaliCacheImages extends Command
{
    protected $signature   = 'sekali:cache-images {--force : Re-download already cached images}';
    protected $description = 'Barcha Sekali o\'yin rasmlarini serverga yuklab diskka saqlash';

    private const CACHE_DIR = 'image-proxy';

    public function handle(): int
    {
        $urls = DB::table('sekali_products')
            ->whereNotNull('image_url')
            ->where('image_url', '!=', '')
            ->distinct()
            ->pluck('image_url')
            ->unique()
            ->values();

        $total   = $urls->count();
        $cached  = 0;
        $skipped = 0;
        $failed  = 0;

        $this->info("Jami {$total} ta rasm URL topildi.");
        $bar = $this->output->createProgressBar($total);
        $bar->start();

        foreach ($urls as $url) {
            $hash     = md5($url);
            $filePath = self::CACHE_DIR . '/' . $hash;
            $metaPath = self::CACHE_DIR . '/' . $hash . '.type';

            if (!$this->option('force') && Storage::disk('local')->exists($filePath)) {
                $skipped++;
                $bar->advance();
                continue;
            }

            try {
                $res = Http::timeout(20)
                    ->withHeaders([
                        'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                        'Referer'    => rtrim(config('app.url'), '/') . '/',
                        'Accept'     => 'image/webp,image/avif,image/apng,image/*,*/*;q=0.8',
                    ])
                    ->get($url);

                if (!$res->ok() || strlen($res->body()) < 64) {
                    $failed++;
                    $bar->advance();
                    continue;
                }

                $contentType = $res->header('Content-Type') ?? 'image/jpeg';
                $contentType = trim(explode(';', $contentType)[0]);
                if (!str_starts_with($contentType, 'image/')) {
                    $contentType = 'image/jpeg';
                }

                Storage::disk('local')->put($filePath, $res->body());
                Storage::disk('local')->put($metaPath, $contentType);
                $cached++;
            } catch (\Throwable $e) {
                $failed++;
            }

            $bar->advance();
            // Small pause to avoid hammering the CDN
            usleep(80_000); // 80ms
        }

        $bar->finish();
        $this->newLine(2);
        $this->info("Natija: {$cached} yangi saqlandi | {$skipped} allaqachon bor edi | {$failed} xato");

        return 0;
    }
}
