<?php

// app/Models/Service.php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Service extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'title',
        'service_type',
        'value',
        'sell_price',
        'sell_currency',
        'cost_price',
        'cost_currency',
        'is_active',
        'visible_to_users',
        'visible_to_resellers',
        'created_at',
    ];

    protected $casts = [
        'is_active'            => 'boolean',
        'visible_to_users'     => 'boolean',
        'visible_to_resellers' => 'boolean',
        'sell_price'           => 'float',
        'cost_price'           => 'float',
    ];
}
