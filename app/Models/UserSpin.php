<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserSpin extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'sector_id',
        'reward_type',
        'reward_value',
        'created_at',
    ];
}