<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PaymentCard extends Model
{
    protected $fillable = [
        'card_number',
        'card_holder',
        'bank_name',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];
}
