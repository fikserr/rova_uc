<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SpinLimit extends Model
{
    public $timestamps = false;
    protected $primaryKey = 'user_id';
    public $incrementing = false;

    protected $fillable = [
        'user_id',
        'spins_today',
        'last_spin_date',
    ];
}
