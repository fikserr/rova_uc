<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SekaliOrder extends Model
{
    protected $fillable = [
        'ref_id',
        'user_id',
        'sekali_product_id',
        'game_target',
        'zone_id',
        'quantity',
        'price_uzs',
        'regular_price_uzs',
        'price_idr',
        'status',
        'sekali_invoice',
        'notes',
    ];

    protected $casts = [
        'price_uzs' => 'integer',
        'price_idr' => 'integer',
        'quantity'  => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(SekaliProduct::class, 'sekali_product_id');
    }
}
