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
        'image_url',
        'name',
        'price_idr',
        'price_uzs',
        'markup_percent',
        'order_process',
        'required_fields',
        'has_validation',
        'stock',
        'is_active',
        'visible_to_users',
        'visible_to_resellers',
        'synced_at',
    ];

    protected $casts = [
        'required_fields'      => 'array',
        'has_validation'       => 'boolean',
        'is_active'            => 'boolean',
        'visible_to_users'     => 'boolean',
        'visible_to_resellers' => 'boolean',
        'synced_at'            => 'datetime',
        'price_idr'            => 'integer',
        'price_uzs'            => 'integer',
        'markup_percent'       => 'float',
    ];

    public function orders(): HasMany
    {
        return $this->hasMany(SekaliOrder::class, 'sekali_product_id');
    }

    public function recalculateUzs(float $idrToUzs): void
    {
        $this->price_uzs = (int) ceil($this->price_idr * $idrToUzs * (1 + $this->markup_percent / 100));
    }

    /**
     * Unique games in a given category, one row per game with its
     * representative image (first non-null image_url found).
     */
    public static function gamesForCategory(string $category)
    {
        return static::where('is_active', true)
            ->where('category', $category)
            ->select('game_name', 'image_url')
            ->orderBy('game_name')
            ->get()
            ->groupBy('game_name')
            ->map(fn ($group) => [
                'name'      => $group->first()->game_name,
                'image_url' => $group->first(fn ($g) => $g->image_url)?->image_url,
            ])
            ->values();
    }

    public static function allGames()
    {
    return static::where('is_active', true)
        ->select('category', 'game_name', 'image_url')
        ->orderBy('game_name')
        ->get()
        ->groupBy('game_name')
        ->map(fn ($group) => [
            'name'      => $group->first()->game_name,
            'category'  => $group->first()->category,
            'image_url' => $group->first(fn ($g) => $g->image_url)?->image_url,
        ])
        ->values();
}
}
