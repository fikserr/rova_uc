<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ImageProxyController extends Controller
{
    private const TIMEOUT      = 10;
    private const CACHE_TTL    = 2592000; // 30 days
    private const FAIL_TTL     = 300;     // 5 min negative cache

    private function cacheDir(): string
    {
        $dir = storage_path('app/image-proxy');
        if (!is_dir($dir)) {
            mkdir($dir, 0775, true);
        }
        return $dir;
    }

    public function show(Request $request)
    {
        $url = $request->query('url');

        if (!$url || !filter_var($url, FILTER_VALIDATE_URL)) {
            return $this->placeholder(true);
        }

        $scheme = parse_url($url, PHP_URL_SCHEME);
        if (!in_array($scheme, ['http', 'https'])) {
            return $this->placeholder(true);
        }

        $hash     = md5($url);
        $dir      = $this->cacheDir();
        $filePath = $dir . DIRECTORY_SEPARATOR . $hash;
        $metaPath = $dir . DIRECTORY_SEPARATOR . $hash . '.type';
        $failPath = $dir . DIRECTORY_SEPARATOR . $hash . '.fail';

        // Negative cache — recent failure, don't retry yet
        if (file_exists($failPath) && (time() - (int) file_get_contents($failPath)) < self::FAIL_TTL) {
            return $this->placeholder(true);
        }

        // Disk cache HIT
        if (file_exists($filePath)) {
            $type = file_exists($metaPath) ? trim(file_get_contents($metaPath)) : 'image/jpeg';
            $body = file_get_contents($filePath);
            $etag = '"' . $hash . '"';

            if ($request->header('If-None-Match') === $etag) {
                return response('', 304, [
                    'Cache-Control' => 'public, max-age=' . self::CACHE_TTL,
                    'ETag'          => $etag,
                ]);
            }

            return response($body, 200, [
                'Content-Type'  => $type,
                'Cache-Control' => 'public, max-age=' . self::CACHE_TTL,
                'ETag'          => $etag,
                'X-Cache'       => 'HIT',
            ]);
        }

        // Fetch from origin
        try {
            $res = Http::timeout(self::TIMEOUT)
                ->withHeaders([
                    'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Accept'     => 'image/webp,image/avif,image/apng,image/*,*/*;q=0.8',
                ])
                ->get($url);
        } catch (\Throwable $e) {
            Log::warning('ImageProxy: fetch failed', ['url' => $url, 'error' => $e->getMessage()]);
            file_put_contents($failPath, (string) time());
            return $this->placeholder(true);
        }

        if (!$res->ok()) {
            file_put_contents($failPath, (string) time());
            return $this->placeholder(true);
        }

        $contentType = $res->header('Content-Type') ?? 'image/jpeg';
        $contentType = trim(explode(';', $contentType)[0]);
        if (!str_starts_with($contentType, 'image/')) {
            $contentType = 'image/jpeg';
        }

        $body = $res->body();
        if (strlen($body) < 64) {
            file_put_contents($failPath, (string) time());
            return $this->placeholder(true);
        }

        file_put_contents($filePath, $body);
        file_put_contents($metaPath, $contentType);

        // Clean up any previous fail marker
        if (file_exists($failPath)) {
            @unlink($failPath);
        }

        $etag = '"' . $hash . '"';
        return response($body, 200, [
            'Content-Type'  => $contentType,
            'Cache-Control' => 'public, max-age=' . self::CACHE_TTL,
            'ETag'          => $etag,
            'X-Cache'       => 'MISS',
        ]);
    }

    private function placeholder(bool $shortCache = false): \Illuminate\Http\Response
    {
        // 1×1 transparent PNG
        $png = base64_decode(
            'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='
        );
        return response($png, 200, [
            'Content-Type'  => 'image/png',
            'Cache-Control' => $shortCache ? 'public, max-age=' . self::FAIL_TTL : 'no-store',
        ]);
    }
}
