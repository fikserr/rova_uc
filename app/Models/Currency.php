<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Currency extends Model
{
    public $timestamps = false;
    protected $primaryKey = 'code';
    public $incrementing = false;

    protected $fillable = [
        'code', 'name', 'symbol', 'is_base', 'is_active'
    ];

    protected $casts = [
        'is_base' => 'boolean',
        'is_active' => 'boolean',
    ];

    public function rates()
    {
        return $this->hasMany(CurrencyRate::class, 'currency_code', 'code');
    }
}
