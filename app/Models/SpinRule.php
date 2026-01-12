<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SpinRule extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'min_total_deposit',
        'spins_count',
        'is_active',
    ];
}
