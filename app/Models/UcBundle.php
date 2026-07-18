<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UcBundle extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'title',
        'image_path',
        'sell_price',
        'sell_currency',
        'cost_price',
        'cost_currency',
        'is_active',
        'visible_to_users',
        'visible_to_resellers',
        'sort_order',
        'created_at',
    ];

    protected $casts = [
        'is_active'            => 'boolean',
        'visible_to_users'     => 'boolean',
        'visible_to_resellers' => 'boolean',
        'sell_price'           => 'float',
        'cost_price'           => 'float',
        'sort_order'           => 'integer',
    ];
}
