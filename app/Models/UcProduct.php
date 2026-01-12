<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UcProduct extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'title',
        'uc_amount',
        'sell_price',
        'sell_currency',
        'cost_price',
        'cost_currency',
        'is_active',
        'created_at',
    ];
}
