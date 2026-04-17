<?php

use App\Http\Controllers\Api\TelegramWebAppController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Bot\TelegramBotController;
use App\Http\Controllers\Payment\ClickController;

Route::post('/users/start', [UserController::class, 'start'])->middleware('throttle:30,1');
Route::post('/users/phone', [UserController::class, 'savePhone'])->middleware('throttle:10,1');
Route::post('/telegram/webapp/auth', [TelegramWebAppController::class, 'authenticate'])->middleware('throttle:30,1');
Route::middleware('telegram.webapp')->get('/telegram/webapp/me', [TelegramWebAppController::class, 'me']);

Route::post('/click/prepare', [ClickController::class, 'prepare'])->middleware('throttle:60,1');
Route::post('/click/complete', [ClickController::class, 'complete'])->middleware('throttle:60,1');