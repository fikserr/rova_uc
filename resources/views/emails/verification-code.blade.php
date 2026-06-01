<!DOCTYPE html>
<html lang="uz">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email tasdiqlash</title>
    <style>
        body { margin: 0; padding: 0; background: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
        .wrapper { max-width: 480px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
        .header { background: linear-gradient(135deg, #3b82f6, #6366f1); padding: 32px 40px; text-align: center; }
        .header h1 { margin: 0; color: #fff; font-size: 22px; font-weight: 700; letter-spacing: -0.3px; }
        .header p  { margin: 6px 0 0; color: rgba(255,255,255,0.8); font-size: 13px; }
        .body { padding: 36px 40px; }
        .body p  { margin: 0 0 16px; color: #475569; font-size: 14px; line-height: 1.6; }
        .code-box { background: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0; }
        .code { font-size: 38px; font-weight: 800; letter-spacing: 10px; color: #1e293b; font-family: 'Courier New', monospace; }
        .expire { font-size: 12px; color: #94a3b8; margin-top: 8px; }
        .footer { background: #f8fafc; padding: 20px 40px; text-align: center; }
        .footer p { margin: 0; color: #94a3b8; font-size: 12px; }
    </style>
</head>
<body>
<div class="wrapper">
    <div class="header">
        <h1>{{ $appName }}</h1>
        <p>Email manzilini tasdiqlash</p>
    </div>
    <div class="body">
        <p>Salom! Email manzilingizni tasdiqlash uchun quyidagi kodni kiriting:</p>
        <div class="code-box">
            <div class="code">{{ $code }}</div>
            <div class="expire">Kod 10 daqiqa davomida amal qiladi</div>
        </div>
        <p>Agar siz bu so'rovni yubormagan bo'lsangiz, ushbu xatni e'tiborsiz qoldiring.</p>
    </div>
    <div class="footer">
        <p>© {{ date('Y') }} {{ $appName }}. Barcha huquqlar himoyalangan.</p>
    </div>
</div>
</body>
</html>
