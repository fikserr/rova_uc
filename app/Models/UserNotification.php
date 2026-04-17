<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserNotification extends Model
{
    public $timestamps = false;

    protected $table = 'user_notifications';

    protected $casts = [
        'is_read' => 'boolean',
        'created_at' => 'datetime',
    ];

    protected $fillable = [
        'user_id',
        'source',
        'order_type',
        'order_id',
        'status',
        'title',
        'message',
        'description',
        'is_read',
        'created_at',
    ];
}

