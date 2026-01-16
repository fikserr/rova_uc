<?php

use App\Http\Controllers\Admin\CurrencyController;
use App\Http\Controllers\Admin\MlProductController;
use App\Http\Controllers\Admin\ServiceController;
use App\Http\Controllers\Admin\SpinRuleController;
use App\Http\Controllers\Admin\SpinSectorController;
use App\Http\Controllers\Admin\UcProductController;
use Illuminate\Support\Facades\Route;

use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Admin/Dashboard');
});
// UC products uchun route lar shu yerda bo'ladi

Route::get('/products-uc', action: [UcProductController::class, 'index'])
    ->name('uc-products.index');
Route::post('/uc-products', [UcProductController::class, 'store'])
    ->name('uc-products.store');
Route::put('/uc-products/{product}', [UcProductController::class, 'update'])
    ->name('uc-products.update');
Route::delete('/uc-products/{product}', [UcProductController::class, 'destroy'])
    ->name('uc-products.destroy');
Route::get('/currencies', [CurrencyController::class, 'index'])
    ->name('currencies.index');

Route::post('/currencies', [CurrencyController::class, 'store'])
    ->name('currencies.store');

Route::put('/currencies/{currency}', [CurrencyController::class, 'update'])
    ->name('currencies.update');

// Kurs qo‘shish
Route::post('/currencies/rate', [CurrencyController::class, 'storeRate'])
    ->name('currencies.rate.store');


Route::get('/products-services', [ServiceController::class, 'index'])
    ->name('services.index');

Route::post('/services', [ServiceController::class, 'store'])
    ->name('services.store');

Route::put('/services/{service}', [ServiceController::class, 'update'])
    ->name('services.update');

Route::delete('/services/{service}', [ServiceController::class, 'destroy'])
    ->name('services.destroy');
Route::get('/spin-sectors', [SpinSectorController::class, 'index'])
    ->name('spin-sectors.index');

Route::post('/spin-sectors', [SpinSectorController::class, 'store'])
    ->name('spin-sectors.store');

Route::put('/spin-sectors/{sector}', [SpinSectorController::class, 'update'])
    ->name('spin-sectors.update');

Route::delete('/spin-sectors/{sector}', [SpinSectorController::class, 'destroy'])
    ->name('spin-sectors.destroy');

Route::get('/spin-rules', [SpinRuleController::class, 'index'])
    ->name('spin-rules.index');

Route::post('/spin-rules', [SpinRuleController::class, 'store'])
    ->name('spin-rules.store');

Route::put('/spin-rules/{rule}', [SpinRuleController::class, 'update'])
    ->name('spin-rules.update');

Route::delete('/spin-rules/{rule}', [SpinRuleController::class, 'destroy'])
    ->name('spin-rules.destroy');
Route::get('/products-ml', [MlProductController::class, 'index'])
    ->name('ml-products.index');

Route::post('/ml-products', [MlProductController::class, 'store'])
    ->name('ml-products.store');

Route::put('/ml-products/{product}', [MlProductController::class, 'update'])
    ->name('ml-products.update');

Route::delete('/ml-products/{product}', [MlProductController::class, 'destroy'])
    ->name('ml-products.destroy');



// userlar uchun route lar shu yerda bo'ladi


Route::get('/user-procucts-uc', action: [UcProductController::class, 'userIndex'])
    ->name('user-procucts-uc.index');
Route::get('/user-telegram-stars', [ServiceController::class, 'userStars'])
    ->name('user-telegram-stars.index');
Route::get('/user-telegram-premium', [ServiceController::class, 'userPremium'])
    ->name('user-telegram-premium.index');
    Route::get('/user-ml-products', [MlProductController::class, 'userIndex'])
    ->name('user-ml-products.index');
