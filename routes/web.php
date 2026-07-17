<?php

use App\Http\Controllers\ImageProxyController;
use App\Http\Controllers\Admin\AdminSecurityController;
use App\Http\Controllers\Admin\AuditLogController;
use App\Http\Controllers\Admin\OrderReceiptController;
use App\Http\Controllers\Admin\CurrencyController;
use App\Http\Controllers\Admin\PaymentCardController;
use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Admin\BroadcastNotificationController;
use App\Http\Controllers\Admin\ManualTopupController as AdminManualTopupController;
use App\Http\Controllers\Admin\OrderController;
use App\Http\Controllers\Admin\PromoCodeController;
use App\Http\Controllers\Admin\PromotionController;
use App\Http\Controllers\Admin\UcBundleController;
use App\Http\Controllers\Admin\UcProductController;
use App\Http\Controllers\Admin\ProfitAnalyticsController;
use App\Http\Controllers\Admin\ReferralController;
use App\Http\Controllers\Admin\ServiceController;
use App\Http\Controllers\Admin\SpinRuleController;
use App\Http\Controllers\Admin\SpinSectorController;
use App\Http\Controllers\Admin\SekaliProductController;
use App\Http\Controllers\Auth\TwoFactorController;
use App\Http\Controllers\User\SekaliShopController;
use App\Http\Controllers\Api\TelegramWebAppController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Payment\BinanceController;
use App\Http\Controllers\Payment\ClickController;
use App\Http\Controllers\Payment\PaymentController;
use App\Http\Controllers\User\EmailVerificationController;
use App\Http\Controllers\User\GameVerifyController;
use App\Http\Controllers\User\ManualTopupController;
use App\Http\Controllers\User\PasswordController;
use App\Http\Controllers\User\NotificationController;
use App\Http\Controllers\User\PromoCodeController as UserPromoCodeController;
use App\Http\Controllers\User\PurchaseController;
use App\Http\Controllers\User\ProfileController;
use App\Http\Controllers\User\UserTodoController;
use App\Http\Controllers\Reseller\ResellerDashboardController;
use App\Http\Controllers\Reseller\ResellerShopController;
use App\Http\Controllers\Reseller\ResellerProfileController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::post('/telegram/webapp/session', [TelegramWebAppController::class, 'sessionLogin'])
    ->name('telegram.webapp.session');

Route::get('/login', function () {
    if (auth()->check()) {
        return redirect()->intended('/');
    }

    return Inertia::render('Auth/Login');
})->name('login');

Route::post('/login', [LoginController::class, 'store'])->middleware('throttle:10,1');
Route::get('/2fa/challenge', [TwoFactorController::class, 'showChallenge'])->name('2fa.challenge');
Route::post('/2fa/challenge', [TwoFactorController::class, 'challenge'])->middleware('throttle:10,1');
Route::post('/logout', [LoginController::class, 'destroy']);
Route::post('/click/prepare', [ClickController::class, 'prepare'])->middleware('throttle:60,1');
Route::post('/click/complete', [ClickController::class, 'complete'])->middleware('throttle:60,1');
Route::post('/binance/webhook', [BinanceController::class, 'webhook'])->middleware('throttle:120,1');

Route::middleware(['auth'])->group(function () {
    Route::get('/img', [ImageProxyController::class, 'show'])->middleware('throttle:120,1')->name('img.proxy');
    Route::post('/password', [PasswordController::class, 'store']);
    Route::put('/password/{user}', [PasswordController::class, 'update']);

    Route::get('/', function () {
        $role = auth()->user()?->role;
        if ($role === 'admin') {
            return redirect()->route('admin.dashboard');
        }
        if ($role === 'reseller') {
            return redirect()->route('reseller.dashboard');
        }
        $uid = auth()->id();
        return Inertia::render('User/UserServices', [
            'games'           => \App\Models\SekaliProduct::gamesForCategory('Game'),
            'ucProducts'      => \App\Models\UcProduct::where('is_active', true)->orderBy('sell_price')->get(),
            'bundles'         => \App\Models\UcBundle::where('is_active', true)->orderBy('sort_order')->orderByDesc('id')->get()->map(fn($b) => array_merge($b->toArray(), ['image_url' => $b->image_path ? \Illuminate\Support\Facades\Storage::disk('public')->url($b->image_path) : null])),
            'lastPubgAccount' => $uid ? \Illuminate\Support\Facades\DB::table('pubg_accounts')->where('user_id', $uid)->orderByDesc('id')->first(['pubg_player_id','pubg_name']) : null,
            'topGames'        => \App\Models\TopGame::orderBy('sort_order')->get(['game_name', 'category', 'image_url'])->map(fn($g) => ['name' => $g->game_name, 'category' => $g->category, 'image_url' => $g->image_url]),
        ]);
    });

    Route::middleware(['role:admin'])->group(function () {
        Route::get('/admin/dashboard', [AdminDashboardController::class, 'index'])
            ->name('admin.dashboard');

        Route::get('/admin/security', [AdminSecurityController::class, 'index'])
            ->name('admin.security');
        Route::post('/admin/security/password', [AdminSecurityController::class, 'setPassword'])
            ->name('admin.security.set');
        Route::put('/admin/security/password', [AdminSecurityController::class, 'changePassword'])
            ->name('admin.security.change');

        Route::get('/payment-cards', [PaymentCardController::class, 'index'])
            ->name('payment-cards.index');
        Route::post('/payment-cards', [PaymentCardController::class, 'store'])
            ->name('payment-cards.store');
        Route::put('/payment-cards/{card}', [PaymentCardController::class, 'update'])
            ->name('payment-cards.update');
        Route::delete('/payment-cards/{card}', [PaymentCardController::class, 'destroy'])
            ->name('payment-cards.destroy');

        Route::get('/tasks', function () {
            return Inertia::render('Admin/Tasks');
        });

        Route::get('/products-uc', [UcProductController::class, 'index'])
            ->name('uc-products.index');
        Route::post('/uc-products', [UcProductController::class, 'store'])
            ->name('uc-products.store');
        Route::put('/uc-products/{product}', [UcProductController::class, 'update'])
            ->name('uc-products.update');
        Route::delete('/uc-products/{product}', [UcProductController::class, 'destroy'])
            ->name('uc-products.destroy');

        Route::get('/products-bundles', [UcBundleController::class, 'index'])
            ->name('uc-bundles.index');
        Route::post('/uc-bundles', [UcBundleController::class, 'store'])
            ->name('uc-bundles.store');
        Route::post('/uc-bundles/{bundle}/update', [UcBundleController::class, 'update'])
            ->name('uc-bundles.update');
        Route::delete('/uc-bundles/{bundle}', [UcBundleController::class, 'destroy'])
            ->name('uc-bundles.destroy');


        Route::get('/currencies', [CurrencyController::class, 'index'])
            ->name('currencies.index');
        Route::post('/currencies', [CurrencyController::class, 'store'])
            ->name('currencies.store');
        Route::put('/currencies/{currency}', [CurrencyController::class, 'update'])
            ->name('currencies.update');
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

        Route::get('/sekali-products', [SekaliProductController::class, 'index'])
            ->name('sekali-products.index');
        Route::get('/sekali-products/variants', [SekaliProductController::class, 'variants'])
            ->name('sekali-products.variants');
        Route::put('/sekali-products/{sekaliProduct}', [SekaliProductController::class, 'update'])
            ->name('sekali-products.update');
        Route::post('/sekali-products/bulk-markup', [SekaliProductController::class, 'bulkMarkup'])
            ->name('sekali-products.bulk-markup');
        Route::post('/sekali-products/sync', [SekaliProductController::class, 'sync'])
            ->name('sekali-products.sync');
        Route::post('/admin/top-games/toggle', [SekaliProductController::class, 'toggleTopGame'])
            ->name('admin.top-games.toggle');

        Route::get('/users', [UserController::class, 'index'])
            ->name('users.index');
        Route::put('/users/{userId}/role', [UserController::class, 'updateRole'])
            ->name('users.role');
        Route::post('/users/{userId}/balance', [UserController::class, 'adjustBalance'])
            ->name('users.balance');
        Route::post('/users/{userId}/toggle-block', [UserController::class, 'toggleBlock'])
            ->name('users.toggle-block');
        Route::get('/profit-analytics', [ProfitAnalyticsController::class, 'index'])
            ->name('profit.analytics');
        Route::get('/order-receipts', [OrderReceiptController::class, 'index'])
            ->name('order-receipts.index');
        Route::get('/referral-settings', [ReferralController::class, 'index'])
            ->name('referrals.index');
        Route::post('/referral-settings', [ReferralController::class, 'update'])
            ->name('referrals.update');

        Route::get('/promo-codes', [PromoCodeController::class, 'index'])->name('promo-codes.index');
        Route::post('/promo-codes', [PromoCodeController::class, 'store'])->name('promo-codes.store');
        Route::put('/promo-codes/{promoCode}', [PromoCodeController::class, 'update'])->name('promo-codes.update');
        Route::delete('/promo-codes/{promoCode}', [PromoCodeController::class, 'destroy'])->name('promo-codes.destroy');
        Route::post('/promo-codes/{promoCode}/toggle', [PromoCodeController::class, 'toggle'])->name('promo-codes.toggle');
        Route::get('/audit-logs', [AuditLogController::class, 'index'])->name('audit-logs.index');

        Route::get('/promotions', [PromotionController::class, 'index'])->name('promotions.index');
        Route::post('/promotions', [PromotionController::class, 'store'])->name('promotions.store');
        Route::put('/promotions/{promotion}', [PromotionController::class, 'update'])->name('promotions.update');
        Route::delete('/promotions/{promotion}', [PromotionController::class, 'destroy'])->name('promotions.destroy');
        Route::post('/promotions/{promotion}/toggle', [PromotionController::class, 'toggle'])->name('promotions.toggle');

    });

    // Faqat admin ko'ra oladigan buyurtma boshqaruvi sahifalari
    Route::middleware(['role:admin'])->group(function () {
        Route::get('/all-orders', [OrderController::class, 'allOrders'])
            ->name('orders.all');
        Route::get('/all-orders/data', [OrderController::class, 'allOrdersData'])
            ->name('orders.all.data');
        Route::get('/uc-orders', [OrderController::class, 'ucOrders'])
            ->name('orders.uc');
        Route::get('/uc-orders/data', [OrderController::class, 'ucOrdersData'])
            ->name('orders.uc.data');
        Route::get('/service-orders', [OrderController::class, 'serviceOrders'])
            ->name('orders.service');
        Route::get('/service-orders/data', [OrderController::class, 'serviceOrdersData'])
            ->name('orders.service.data');
        Route::post('/orders/status', [OrderController::class, 'updateStatus'])
            ->name('orders.status');
        Route::post('/orders/sekali/complete', [OrderController::class, 'completeSekaliOrder'])
            ->name('orders.sekali.complete');
        Route::post('/orders/assign-worker', [OrderController::class, 'assignWorker'])
            ->name('orders.assign-worker');
        Route::get('/orders/export', [OrderController::class, 'exportCsv'])
            ->name('orders.export');
        Route::get('/broadcast-notifications', [BroadcastNotificationController::class, 'index'])
            ->name('broadcast-notifications.index');
        Route::post('/broadcast-notifications', [BroadcastNotificationController::class, 'store'])
            ->name('broadcast-notifications.store');
        Route::get('/manual-topups', [AdminManualTopupController::class, 'index'])
            ->name('manual-topups.index');
        Route::post('/manual-topups/{id}/approve', [AdminManualTopupController::class, 'approve'])
            ->name('manual-topups.approve');
        Route::post('/manual-topups/{id}/reject', [AdminManualTopupController::class, 'reject'])
            ->name('manual-topups.reject');
    });

    Route::middleware(['role:reseller'])->group(function () {
        Route::get('/reseller', [ResellerDashboardController::class, 'index'])
            ->name('reseller.dashboard');
        Route::get('/reseller/balance', function () {
            return Inertia::render('Reseller/Balance');
        })->name('reseller.balance');
        Route::get('/reseller/shop', [ResellerShopController::class, 'index'])
            ->name('reseller.shop');
        Route::get('/reseller/shop/variants', [ResellerShopController::class, 'variants'])
            ->middleware('throttle:60,1')
            ->name('reseller.shop.variants');
        Route::post('/reseller/shop/validate', [ResellerShopController::class, 'validateAccount'])
            ->middleware('throttle:30,1')
            ->name('reseller.shop.validate');
        Route::post('/reseller/shop/order', [ResellerShopController::class, 'order'])
            ->middleware('throttle:10,1')
            ->name('reseller.shop.order');
        Route::get('/reseller/profile', [ResellerProfileController::class, 'index'])
            ->name('reseller.profile');
        Route::get('/binance/rate', [BinanceController::class, 'rate'])->name('binance.rate');
        Route::post('/binance/create', [BinanceController::class, 'create'])
            ->middleware('throttle:10,1')
            ->name('binance.create');
    });

    // Shared API routes — user, worker AND reseller can call these
    Route::middleware(['role:user,worker,reseller'])->group(function () {
        Route::post('/payment/create', [PaymentController::class, 'create'])
            ->middleware('throttle:20,1')
            ->name('payment.create');
        Route::get('/payment/status', [PaymentController::class, 'status'])
            ->name('payment.status');
        Route::post('/manual-topup', [ManualTopupController::class, 'store'])
            ->middleware('throttle:5,60')
            ->name('manual-topup.store');
        Route::get('/manual-topup/my', [ManualTopupController::class, 'myRequests'])
            ->name('manual-topup.my');
        Route::get('/payment-cards/active', [PaymentCardController::class, 'active'])
            ->name('payment-cards.active');
        Route::patch('/user/language', function (\Illuminate\Http\Request $request) {
            $lang = $request->validate(['language' => 'required|in:uz,ru,en'])['language'];
            DB::table('users')->where('id', auth()->id())->update(['language' => $lang]);
            return response()->json(['ok' => true]);
        })->name('user.language');
        Route::get('/user-notifications', [NotificationController::class, 'index'])
            ->name('user-notifications.index');
        Route::patch('/user-notifications/{id}/read', [NotificationController::class, 'markAsRead'])
            ->name('user-notifications.read');
    });

    // User & worker only — reseller is BLOCKED from these UI pages
    Route::middleware(['role:user,worker'])->group(function () {
        Route::post('/user/promo/check', [UserPromoCodeController::class, 'check'])
            ->middleware('throttle:20,1')
            ->name('user.promo.check');
        Route::post('/game/verify/pubg', [GameVerifyController::class, 'verifyPubg'])
            ->middleware('throttle:30,1')
            ->name('game.verify.pubg');
        Route::get('/user-products-uc', [UcProductController::class, 'userIndex'])
            ->name('user-products-uc.index');
        Route::get('/user-services', function () {
            $uid = auth()->id();
            return Inertia::render('User/UserServices', [
                'games'           => \App\Models\SekaliProduct::gamesForCategory('Game'),
                'ucProducts'      => \App\Models\UcProduct::where('is_active', true)->orderBy('sell_price')->get(),
                'bundles'         => \App\Models\UcBundle::where('is_active', true)->orderBy('sort_order')->orderByDesc('id')->get()->map(fn($b) => array_merge($b->toArray(), ['image_url' => $b->image_path ? \Illuminate\Support\Facades\Storage::disk('public')->url($b->image_path) : null])),
                'lastPubgAccount' => $uid ? \Illuminate\Support\Facades\DB::table('pubg_accounts')->where('user_id', $uid)->orderByDesc('id')->first(['pubg_player_id','pubg_name']) : null,
                'topGames'        => \App\Models\TopGame::orderBy('sort_order')->get(['game_name', 'category', 'image_url'])->map(fn($g) => ['name' => $g->game_name, 'category' => $g->category, 'image_url' => $g->image_url]),
                'promotions'      => \App\Models\Promotion::active()->get(['title', 'description', 'discount_percent', 'applies_to', 'ends_at', 'banner_color']),
            ]);
        });
        Route::get('/user-profile', [ProfileController::class, 'show'])
            ->name('user-profile.show');
        Route::get('/user-balance', function () {
            return Inertia::render('User/UserBalance');
        })->name('user-balance.index');
        Route::get('/user-profile/user-balance', function () {
            return Inertia::render('User/UserBalance');
        });
        Route::get('/user-purchases', [PurchaseController::class, 'index'])
            ->name('user-purchases.index');
        Route::get('/user-purchases/data', [PurchaseController::class, 'data'])
            ->name('user-purchases.data');
        Route::post('/email/send-code', [EmailVerificationController::class, 'sendCode'])
            ->middleware('throttle:5,10')
            ->name('email.send-code');
        Route::post('/email/verify', [EmailVerificationController::class, 'verify'])
            ->name('email.verify');
        Route::delete('/email', [EmailVerificationController::class, 'remove'])
            ->name('email.remove');
        Route::get('/user-profile/security', function () {
            return Inertia::render('User/UserSecurity');
        });
        Route::get('/user-telegram-stars', [ServiceController::class, 'userStars'])
            ->name('user-telegram-stars.index');
        Route::get('/user-telegram-premium', [ServiceController::class, 'userPremium'])
            ->name('user-telegram-premium.index');
        Route::get('/shop', [SekaliShopController::class, 'index'])
            ->name('sekali-shop.index');
        Route::get('/shop/variants', [SekaliShopController::class, 'variants'])
            ->middleware('throttle:60,1')
            ->name('sekali-shop.variants');
        Route::post('/shop/validate', [SekaliShopController::class, 'validate'])
            ->middleware('throttle:30,1')
            ->name('sekali-shop.validate');
        Route::post('/shop/order', [SekaliShopController::class, 'order'])
            ->middleware('throttle:10,1')
            ->name('sekali-shop.order');
        Route::get('/user-spin', [SpinSectorController::class, 'SpinSector'])
            ->name('user-spin-sectors.index');
        Route::get('/user-tasks', [UserTodoController::class, 'index'])
            ->name('user-tasks.index');
        Route::post('/user-todos', [UserTodoController::class, 'store'])
            ->name('user-todos.store');
        Route::patch('/user-todos/{todo}', [UserTodoController::class, 'toggle'])
            ->name('user-todos.toggle');
        Route::delete('/user-todos/{todo}', [UserTodoController::class, 'destroy'])
            ->name('user-todos.destroy');
    });

    // 2FA — available to all authenticated users
    Route::get('/2fa/setup', [TwoFactorController::class, 'setup'])->name('2fa.setup');
    Route::post('/2fa/generate', [TwoFactorController::class, 'generate'])->name('2fa.generate');
    Route::post('/2fa/enable', [TwoFactorController::class, 'enable'])->name('2fa.enable');
    Route::post('/2fa/disable', [TwoFactorController::class, 'disable'])->name('2fa.disable');
});
