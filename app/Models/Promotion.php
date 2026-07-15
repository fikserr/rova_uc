<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class Promotion extends Model
{
    protected $fillable = [
        'title',
        'description',
        'discount_percent',
        'applies_to',
        'starts_at',
        'ends_at',
        'is_active',
        'banner_color',
    ];

    protected $casts = [
        'is_active'        => 'bool',
        'starts_at'        => 'datetime',
        'ends_at'          => 'datetime',
        'discount_percent' => 'float',
    ];

    public function scopeActive(Builder $query): Builder
    {
        return $query
            ->where('is_active', true)
            ->where('starts_at', '<=', now())
            ->where('ends_at', '>=', now());
    }

    public function getRemainingSeconds(): int
    {
        return max(0, now()->diffInSeconds($this->ends_at, false));
    }
}
