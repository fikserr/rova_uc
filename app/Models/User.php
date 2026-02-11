<?php

namespace App\Models;

use Illuminate\Auth\Authenticatable;
use Illuminate\Contracts\Auth\Authenticatable as AuthenticatableContract;
use Illuminate\Database\Eloquent\Model;

class User extends Model implements AuthenticatableContract
{
    use Authenticatable;

    protected $table = 'users';

    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'int';

    public $timestamps = false;

    protected $fillable = [
        'id',
        'username',
        'phone_number',
        'role',
        'created_at',
    ];

    public function balance()
    {
        return $this->hasOne(UserBalance::class, 'user_id', 'id');
    }

    public function todos()
    {
        return $this->hasMany(UserTodo::class, 'user_id', 'id');
    }
}
