<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class User extends Model
{
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
        'created_at'
    ];

    public function balance()
    {
        return $this->hasOne(UserBalance::class, 'user_id');
    }
}
