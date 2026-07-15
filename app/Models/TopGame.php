<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TopGame extends Model
{
    protected $fillable = ['category', 'game_name', 'image_url', 'sort_order'];
}
