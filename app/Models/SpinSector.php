<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SpinSector extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'title',
        'reward_type',
        'reward_value',
        'probability',
        'is_active',
    ];
}
