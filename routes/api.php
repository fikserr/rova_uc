<?php

use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Bot\TelegramBotController;



Route::post('/users/start', [UserController::class, 'start']);
Route::post('/users/phone', [UserController::class, 'savePhone']);
