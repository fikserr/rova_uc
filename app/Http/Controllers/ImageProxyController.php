<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class ImageProxyController extends Controller
{
    public function show(Request $request)
    {
        $url = $request->query('url');

        if (!$url || !filter_var($url, FILTER_VALIDATE_URL)) {
            return response('Bad Request', 400);
        }

        $scheme = parse_url($url, PHP_URL_SCHEME);
        if (!in_array($scheme, ['http', 'https'])) {
            return response('Bad Request', 400);
        }

        $cacheKey = 'imgp_' . md5($url);

        $cached = Cache::get($cacheKey);
        if ($cached) {
            return response(base64_decode($cached['body']), 200, [
                'Content-Type'  => $cached['type'],
                'Cache-Control' => 'public, max-age=604800',
            ]);
        }

        try {
            $res = Http::timeout(12)
                ->withHeaders([
                    'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Referer'    => 'https://sekalipay.com/',
                ])
                ->get($url);
        } catch (\Throwable) {
            return response('Gateway Timeout', 502);
        }

        if (!$res->ok()) {
            return response('Not Found', 404);
        }

        $type = $res->header('Content-Type') ?? 'image/jpeg';
        if (!str_starts_with($type, 'image/')) {
            $type = 'image/jpeg';
        }

        $data = ['body' => base64_encode($res->body()), 'type' => $type];
        Cache::put($cacheKey, $data, now()->addWeek());

        return response($data['body'], 200, [
            'Content-Type'  => $type,
            'Cache-Control' => 'public, max-age=604800',
        ]);
    }
}
