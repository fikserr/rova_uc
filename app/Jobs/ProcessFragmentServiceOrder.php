<?php

namespace App\Jobs;

use App\Services\FragmentApiService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProcessFragmentServiceOrder implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $backoff = 60;

    public function __construct(public readonly int $serviceOrderId) {}

    public function handle(FragmentApiService $fragment): void
    {
        if (!$fragment->isConfigured()) {
            Log::warning('ProcessFragmentServiceOrder: FRAGMENT_AUTH_KEY not set, skipping', [
                'order_id' => $this->serviceOrderId,
            ]);
            return;
        }

        $fragment->processServiceOrder($this->serviceOrderId);
    }
}
