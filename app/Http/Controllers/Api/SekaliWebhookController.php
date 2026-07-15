<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SekaliOrder;
use App\Services\ReceiptService;
use App\Services\SekaliPayService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class SekaliWebhookController extends Controller
{
    // Possible "completed" event names SekalıPay might send
    private const COMPLETED_EVENTS = ['order.completed', 'order.success', 'order.delivered', 'transaction.completed'];
    private const CANCELED_EVENTS  = ['order.canceled', 'order.failed', 'order.refunded', 'transaction.canceled'];
    private const COMPLETED_STATUSES = ['completed', 'success', 'delivered', 'paid'];
    private const CANCELED_STATUSES  = ['canceled', 'failed', 'refunded'];

    public function handle(Request $request, SekaliPayService $api): \Illuminate\Http\Response
    {
        $body      = $request->getContent();
        $signature = $request->header('X-Signature', '');
        $timestamp = $request->header('X-Timestamp', '');
        $event     = $request->header('X-Event', $request->input('event', ''));

        if (!$api->verifyWebhookSignature($body, $signature, $timestamp)) {
            Log::warning('SekaliPay webhook: invalid signature', [
                'event'     => $event,
                'signature' => $signature,
                'timestamp' => $timestamp,
            ]);
            return response('Unauthorized', 401);
        }

        $payload = json_decode($body, true) ?? [];
        $refId   = $payload['data']['ref_id'] ?? $payload['ref_id'] ?? null;
        $status  = $payload['data']['status']  ?? $payload['status']  ?? null;
        $invoice = $payload['data']['invoice'] ?? $payload['invoice'] ?? null;

        // Full payload log — debugging uchun
        Log::info('SekaliPay webhook keldi', [
            'event'   => $event,
            'ref_id'  => $refId,
            'status'  => $status,
            'invoice' => $invoice,
            'payload' => $payload,
        ]);

        if (!$refId) {
            return response('OK', 200);
        }

        // Event nomi bo'yicha aniqlash
        if (in_array($event, self::COMPLETED_EVENTS)) {
            $this->handleCompleted($refId, $invoice);
        } elseif (in_array($event, self::CANCELED_EVENTS)) {
            $this->handleCanceled($refId);
        } elseif ($event === 'order.paid') {
            $this->updateStatus($refId, 'processing', $invoice);
        } elseif ($status !== null) {
            // Event nomi noaniq bo'lsa — statusdan aniqlaymiz
            if (in_array($status, self::COMPLETED_STATUSES)) {
                Log::info("SekaliPay webhook: event='{$event}' noaniq, status='{$status}' bo'yicha completed deb olinadi");
                $this->handleCompleted($refId, $invoice);
            } elseif (in_array($status, self::CANCELED_STATUSES)) {
                Log::info("SekaliPay webhook: event='{$event}' noaniq, status='{$status}' bo'yicha canceled deb olinadi");
                $this->handleCanceled($refId);
            } else {
                Log::warning("SekaliPay webhook: noma'lum event='{$event}', status='{$status}'", $payload);
            }
        } else {
            Log::warning("SekaliPay webhook: noma'lum event='{$event}', status yo'q", $payload);
        }

        return response('OK', 200);
    }

    private function handleCompleted(string $refId, ?string $invoice): void
    {
        $alreadyDone = false;

        DB::transaction(function () use ($refId, $invoice, &$alreadyDone) {
            $order = SekaliOrder::where('ref_id', $refId)
                ->lockForUpdate()
                ->first();

            if (!$order || $order->status === 'completed') {
                $alreadyDone = true;
                return;
            }

            $order->update([
                'status'         => 'completed',
                'sekali_invoice' => $invoice ?? $order->sekali_invoice,
            ]);
        });

        if ($alreadyDone) return;

        Log::info("SekaliPay: buyurtma #{$refId} yakunlandi.");
        app(ReceiptService::class)->record('sekali', $refId);
    }

    private function handleCanceled(string $refId): void
    {
        DB::transaction(function () use ($refId) {
            $order = SekaliOrder::where('ref_id', $refId)
                ->lockForUpdate()
                ->first();

            if (!$order || in_array($order->status, ['completed', 'canceled'])) {
                return;
            }

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
