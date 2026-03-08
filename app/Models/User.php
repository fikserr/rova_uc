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
        'role',
    ];

    /**
     * The primary key type is integer (unsignedBigInteger)
     */
    protected $keyType = 'int';


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
