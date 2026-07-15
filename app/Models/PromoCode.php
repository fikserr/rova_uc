<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PromoCode extends Model
{
    protected $fillable = [
        'code',
        'discount_type',
        'discount_value',
        'min_order_amount',
        'max_uses',
        'uses_count',
        'is_active',
        'expires_at',
    ];

    protected $casts = [
        'is_active'      => 'bool',
        'expires_at'     => 'datetime',
        'discount_value' => 'float',
        'discount_percent' => 'float',
    ];

    public function isValid(float $orderAmount): bool
    {
        if (! $this->is_active) {
            return false;
        }

        if ($this->expires_at !== null && $this->expires_at->isPast()) {
            return false;
        }

        if ($this->max_uses !== null && $this->uses_count >= $this->max_uses) {
            return false;
        }

        if ($orderAmount < $this->min_order_amount) {
            return false;
        }

        return true;
    }
}
