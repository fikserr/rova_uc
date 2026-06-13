<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'id',
        'username',
        'phone_number',
        'email',
        'email_verified_at',
        'role',
        'is_blocked',
    ];

    protected $casts = [
        'is_blocked'        => 'boolean',
        'email_verified_at' => 'datetime',
    ];

    // Use 'string' so PDO binds large Telegram IDs (>2.1B) via PARAM_STR,
    // avoiding 32-bit integer truncation in PDO parameter binding.
    protected $keyType = 'string';


    public function balance()
    {
        return $this->hasOne(UserBalance::class, 'user_id', 'id');
    }

    public function todos()
    {
        return $this->hasMany(UserTodo::class, 'user_id', 'id');
    }
    public function password()
    {
        return $this->hasOne(Password::class, 'user_id', 'id');
    }
}
