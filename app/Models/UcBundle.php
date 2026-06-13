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
        'sort_order',
        'created_at',
    ];

    protected $casts = [
        'is_active'  => 'boolean',
        'sell_price' => 'float',
        'cost_price' => 'float',
        'sort_order' => 'integer',
    ];
}
