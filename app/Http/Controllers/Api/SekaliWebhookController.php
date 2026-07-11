<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SekaliOrder;
use App\Services\SekaliPayService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class SekaliWebhookController extends Controller
{
    public function handle(Request $request, SekaliPayService $api): \Illuminate\Http\Response
    {
        $body      = $request->getContent();
        $signature = $request->header('X-Signature', '');
        $timestamp = $request->header('X-Timestamp', '');
        $event     = $request->header('X-Event', $request->input('event', ''));

        if (!$api->verifyWebhookSignature($body, $signature, $timestamp)) {
            Log::warning('SekaliPay webhook: invalid signature');
            return response('Unauthorized', 401);
        }

        $payload = json_decode($body, true);
        $refId   = $payload['data']['ref_id'] ?? null;
        $status  = $payload['data']['status'] ?? null;
        $invoice = $payload['data']['invoice'] ?? null;

        Log::info("SekaliPay webhook: event={$event}, ref_id={$refId}, status={$status}");

        if (!$refId) {
            return response('OK', 200);
        }

        match ($event) {
            'order.completed' => $this->handleCompleted($refId, $invoice),
            'order.canceled'  => $this->handleCanceled($refId, $payload),
            'order.paid'      => $this->updateStatus($refId, 'processing', $invoice),
            default           => null,
        };

        return response('OK', 200);
    }

    private function handleCompleted(string $refId, ?string $invoice): void
    {
        DB::transaction(function () use ($refId, $invoice) {
            $order = SekaliOrder::where('ref_id', $refId)
                ->lockForUpdate()
                ->first();

            if (!$order || $order->status === 'completed') {
                return;
            }

            $order->update([
                'status'         => 'completed',
                'sekali_invoice' => $invoice,
            ]);
        });

        Log::info("SekaliPay: buyurtma #{$refId} yakunlandi.");
    }

    private function handleCanceled(string $refId, array $payload): void
    {
        DB::transaction(function () use ($refId, $payload) {
            $order = SekaliOrder::where('ref_id', $refId)
                ->lockForUpdate()
                ->first();

            if (!$order || in_array($order->status, ['completed', 'canceled'])) {
                return;
            }

            // Balansni qaytarish
            DB::table('user_balances')
                ->where('user_id', $order->user_id)
                ->increment('balance', $order->price_uzs);

            $order->update([
                'status' => 'canceled',
                'notes'  => 'SekalıPay tomonidan bekor qilindi',
            ]);
        });

        Log::info("SekaliPay: buyurtma #{$refId} bekor qilindi, balans qaytarildi.");
    }

    private function updateStatus(string $refId, string $status, ?string $invoice): void
    {
        SekaliOrder::where('ref_id', $refId)->update([
            'status'         => $status,
            'sekali_invoice' => $invoice ?? null,
        ]);
    }
}
