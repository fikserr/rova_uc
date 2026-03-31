<?php

use App\Http\Controllers\Api\TelegramWebAppController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Bot\TelegramBotController;
use App\Http\Controllers\Payment\ClickController;

Route::post('/users/start', action: [UserController::class, 'start']);
Route::post('/users/phone', action: [UserController::class, 'savePhone']);
Route::post('/telegram/webapp/auth', [TelegramWebAppController::class, 'authenticate']);
Route::middleware('telegram.webapp')->get('/telegram/webapp/me', [TelegramWebAppController::class, 'me']);


Route::post('/click/prepare', [ClickController::class, 'prepare']);
Route::post('/click/complete', [ClickController::class, 'complete']);