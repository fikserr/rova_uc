<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MlProduct extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'title',
        'diamonds',
        'sell_price',
        'sell_currency',
        'cost_price',
        'cost_currency',
        'is_active',
        'created_at',
    ];
}
