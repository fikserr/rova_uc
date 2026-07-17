<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class ImageProxyController extends Controller
{
    private const CACHE_DIR  = 'image-proxy';
    private const TIMEOUT    = 15;

    public function show(Request $request)
    {
        $url = $request->query('url');

        if (!$url || !filter_var($url, FILTER_VALIDATE_URL)) {
            return $this->placeholder();
        }

        $scheme = parse_url($url, PHP_URL_SCHEME);
        if (!in_array($scheme, ['http', 'https'])) {
            return $this->placeholder();
        }

        $hash     = md5($url);
        $filePath = self::CACHE_DIR . '/' . $hash;
        $metaPath = self::CACHE_DIR . '/' . $hash . '.type';

        // ── Disk cache hit ─────────────────────────────────────
        if (Storage::disk('local')->exists($filePath)) {
            $type = Storage::disk('local')->exists($metaPath)
                ? trim(Storage::disk('local')->get($metaPath))
                : 'image/jpeg';

            return response(Storage::disk('local')->get($filePath), 200, [
                'Content-Type'  => $type,
                'Cache-Control' => 'public, max-age=2592000',
                'X-Cache'       => 'HIT',
            ]);
        }

        // ── Fetch from origin ───────────────────────────────────
        try {
            $res = Http::timeout(self::TIMEOUT)
                ->withHeaders([
                    'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                    'Referer'    => rtrim(config('app.url'), '/') . '/',
                    'Accept'     => 'image/webp,image/avif,image/apng,image/*,*/*;q=0.8',
                ])
                ->get($url);
        } catch (\Throwable $e) {
            Log::warning('ImageProxy: fetch failed', ['url' => $url, 'error' => $e->getMessage()]);
            return $this->placeholder();
        }

        if (!$res->ok()) {
            return $this->placeholder();
        }

        $contentType = $res->header('Content-Type') ?? 'image/jpeg';
        $contentType = trim(explode(';', $contentType)[0]);
        if (!str_starts_with($contentType, 'image/')) {
            $contentType = 'image/jpeg';
        }

        $body = $res->body();

        if (strlen($body) < 64) {
            return $this->placeholder();
        }

        // Save raw bytes to disk
        Storage::disk('local')->put($filePath, $body);
        Storage::disk('local')->put($metaPath, $contentType);

        return response($body, 200, [
            'Content-Type'  => $contentType,
            'Cache-Control' => 'public, max-age=2592000',
            'X-Cache'       => 'MISS',
        ]);
    }

    private function placeholder()
    {
        // 1×1 transparent PNG
        $png = base64_decode(
            'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='
        );
        return response($png, 200, [
            'Content-Type'  => 'image/png',
            'Cache-Control' => 'no-store',
        ]);
    }
}
