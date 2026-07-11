<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SekaliProduct extends Model
{
    protected $fillable = [
        'sekali_item_id',
        'sekali_sku',
        'category',
        'game_name',
        'product_type',
        'name',
        'price_idr',
        'price_uzs',
        'markup_percent',
        'order_process',
        'required_fields',
        'has_validation',
        'stock',
        'is_active',
        'synced_at',
    ];

    protected $casts = [
        'required_fields' => 'array',
        'has_validation'  => 'boolean',
        'is_active'       => 'boolean',
        'synced_at'       => 'datetime',
        'price_idr'       => 'integer',
        'price_uzs'       => 'integer',
        'markup_percent'  => 'float',
    ];

    public function orders(): HasMany
    {
        return $this->hasMany(SekaliOrder::class, 'sekali_product_id');
    }

    public function recalculateUzs(float $idrToUzs): void
    {
        $this->price_uzs = (int) ceil($this->price_idr * $idrToUzs * (1 + $this->markup_percent / 100));
    }
}
