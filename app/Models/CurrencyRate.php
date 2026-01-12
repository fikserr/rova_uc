<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CurrencyRate extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'currency_code',
        'rate_to_base',
        'created_at'
    ];

    public function currency()
    {
        return $this->belongsTo(Currency::class, 'currency_code', 'code');
    }
}
