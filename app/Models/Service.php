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
        'created_at',
    ];
}
