<?php

use App\Http\Controllers\Api\TelegramWebAppController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Bot\TelegramBotController;

Route::post('/users/start', [UserController::class, 'start']);
Route::post('/users/phone', [UserController::class, 'savePhone']);
Route::post('/telegram/webapp/auth', [TelegramWebAppController::class, 'authenticate']);
Route::middleware('telegram.webapp')->get('/telegram/webapp/me', [TelegramWebAppController::class, 'me']);
