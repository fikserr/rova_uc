# Telegram WebApp Authentication Fixes

## Issues Found & Fixed

### 1. **Route Middleware Issue** 
**Problem:** The POST route `/telegram/webapp/session` had the `telegram.webapp` middleware applied twice:
- The route itself had `.middleware('telegram.webapp')`  
- The middleware was verifying initData BEFORE the controller could run
- This prevented the controller's own verification from even executing

**Fix:** Removed the middleware from the POST route since the controller (`sessionLogin`) already performs verification via `TelegramAuthService::verify()`.

```php
// BEFORE
Route::post('/telegram/webapp/session', [TelegramWebAppController::class, 'sessionLogin'])
    ->middleware('telegram.webapp')
    ->name('telegram.webapp.session');

// AFTER  
Route::post('/telegram/webapp/session', [TelegramWebAppController::class, 'sessionLogin'])
    ->name('telegram.webapp.session');
```

### 2. **JSON Body Parsing Issue**
**Problem:** Frontend sends `Content-Type: application/json` with body `{ init_data: initData }`, but the backend methods used `$request->input('init_data')` which doesn't automatically parse JSON bodies.

**Fix:** Updated both the middleware (`VerifyTelegramWebApp`) and controller (`TelegramWebAppController`) to properly handle JSON body parsing:

```php
// Check JSON body if Content-Type is application/json
if ($request->isJson()) {
    $json = $request->json()->all();
    if ($initData = $json['initData'] ?? $json['init_data']) {
        return (string) $initData;
    }
}
```

### 3. **Missing Error Handling in Frontend**
**Problem:** `TelegramAuthBootstrap.jsx` was silently failing errors with `.catch(() => {})`, making debugging impossible.

**Fix:** Added comprehensive error logging and status messages:
- ✅ Auth success
- ❌ Auth failures with error messages
- 📤 Request sent
- 📌 initData extracted
- ⚠️ No Telegram data found

## Modified Files

1. **[routes/web.php](routes/web.php#L17-L19)** - Removed middleware from auth route
2. **[app/Http/Middleware/VerifyTelegramWebApp.php](app/Http/Middleware/VerifyTelegramWebApp.php#L30-L51)** - Added JSON body parsing
3. **[app/Http/Controllers/Api/TelegramWebAppController.php](app/Http/Controllers/Api/TelegramWebAppController.php#L140-L160)** - Added JSON body parsing  
4. **[resources/js/Components/TelegramAuthBootstrap.jsx](resources/js/Components/TelegramAuthBootstrap.jsx#L12-L64)** - Added error logging and debugging

## How It Works Now

1. **Frontend loads** → `TelegramAuthBootstrap.jsx` runs in useEffect
2. **Check if already authenticated** → If user exists in props, skip
3. **Extract initData** → From `window.Telegram.WebApp.initData` or hash
4. **Send POST request** → To `/telegram/webapp/session` with JSON body
5. **Backend verifies** → `TelegramAuthService::verify()` checks signature and auth_date
6. **Create/Update user** → User is upserted in database with UserBalance
7. **Login user** → `Auth::login($user)` creates session
8. **Reload page** → Frontend reloads to get authenticated props
9. **User is authenticated** → Component detects `props.auth.user` and stops

## Testing

### Via Telegram WebView
When opening in Telegram WebView with initData, you should see in console:
```
📤 Sending Telegram initData to backend...
✅ Auth successful, reloading...
✅ User already authenticated: { id: ..., username: ..., role: 'user' }
```

### Via Browser (Development)
When opening in browser without Telegram, you should see:
```
⚠️ No Telegram initData found
```

### Debugging 
- Check browser console for frontend logs
- Check `storage/logs/laravel.log` for backend logs
- Set `APP_DEBUG=true` in .env for detailed error messages

## Configuration

Ensure your `.env` has:
```
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_INIT_DATA_MAX_AGE=86400  # Optional, defaults to 24 hours
APP_DEBUG=true  # For development
```

## Security Notes

- ✅ All validation happens server-side in `TelegramAuthService::verify()`
- ✅ HMAC signature is verified against bot token
- ✅ Auth date is checked (max 24 hours old + 10 min for clock skew)
- ✅ Session is httpOnly (visible in Network tab but not to JavaScript except through props)
- ⚠️ Never log or expose the init_data in production
