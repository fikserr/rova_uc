# ahost.uz ga Deploy qilish Qo'llanmasi

## Tayyorgarlik (lokal kompyuterda)

Bu qadamlar **allaqachon bajarilgan**:
- [x] `npm run build` - frontend assets build qilindi (`public/build/` papka yaratildi)
- [x] `php artisan config:cache` - konfiguratsiya keshga saqlandi
- [x] `php artisan route:cache` - routelar keshga saqlandi
- [x] `php artisan view:cache` - Blade viewlar keshga saqlandi

---

## Serverda Papka Strukturasi

ahost.uz da fayllar quyidagicha joylashishi kerak:

```
/home/USERNAME/
├── rova_uc/          ← Loyiha asosiy papkasi (bu yerga yuklanadi)
│   ├── app/
│   ├── bootstrap/
│   ├── config/
│   ├── database/
│   ├── resources/
│   ├── routes/
│   ├── storage/
│   ├── vendor/
│   ├── .env          ← .env.production nusxasidan yaratiladi
│   └── ...
└── public_html/      ← Sayt uchun ochiq papka
    ├── index.php     ← deploy_public_index.php nusxasi
    ├── .htaccess     ← public/.htaccess nusxasi
    ├── build/        ← public/build/ nusxasi
    ├── favicon.ico
    └── robots.txt
```

---

## Qadamlar

### 1. Loyihani zip qilish

Quyidagi fayllar/papkalarni ZIP ga kiritish **SHART EMAS** (yuklamang):
- `node_modules/`
- `.git/`
- `.env` (mahalliy)
- `.env.production`
- `deploy_public_index.php`
- `DEPLOY.md`

ZIP qilish kerak bo'lgan asosiy papkalar:
```
app/ bootstrap/ config/ database/ resources/ routes/ storage/ vendor/
artisan composer.json composer.lock public/ (faqat public/build va public/.htaccess)
```

### 2. ahost cPanel ga kirish

1. ahost.uz cPanel ga kiring
2. **File Manager** → `/home/USERNAME/` papkasini oching
3. `rova_uc` nomli yangi papka yarating (public_html **tashqarisida**)

### 3. Fayllarni yuklash

**`/home/USERNAME/rova_uc/` ga yuklash kerak:**
- `app/`, `bootstrap/`, `config/`, `database/`, `resources/`, `routes/`, `storage/`, `vendor/`
- `artisan`, `composer.json`, `composer.lock`

**`/home/USERNAME/public_html/` ga yuklash kerak:**
- `public/.htaccess` → `public_html/.htaccess`
- `public/build/` → `public_html/build/` (butun papka)
- `public/favicon.ico` → `public_html/favicon.ico`
- `public/robots.txt` → `public_html/robots.txt`
- `deploy_public_index.php` → `public_html/index.php` (nomini o'zgartirish!)

### 4. `.env` fayli yaratish

`/home/USERNAME/rova_uc/` papkasida `.env` fayli yarating:

```bash
# .env.production faylini nusxalang va quyidagilarni to'ldiring:
APP_URL=https://SIZNING_DOMENINGIZ.COM

DB_HOST=localhost
DB_DATABASE=ahost_db_nomi      # cPanel → MySQL Databases dan oling
DB_USERNAME=ahost_db_user       # cPanel → MySQL Databases dan oling
DB_PASSWORD=kuchli_parol
```

> **Muhim:** ahost da MySQL host odatda `localhost` bo'ladi.

### 5. cPanel da MySQL yaratish

1. cPanel → **MySQL Databases**
2. Yangi database yarating: masalan `username_rovaucdb`
3. Yangi user yarating parol bilan
4. Userni databasega qo'shing, **ALL PRIVILEGES** bering

### 6. Storage papkasini sozlash

SSH yoki cPanel Terminal orqali:
```bash
chmod -R 755 /home/USERNAME/rova_uc/storage
chmod -R 755 /home/USERNAME/rova_uc/bootstrap/cache
```

### 7. Migratsiyani ishga tushurish

SSH yoki cPanel Terminal:
```bash
cd /home/USERNAME/rova_uc
php artisan migrate --force
```

Agar SSH yo'q bo'lsa, cPanel → **Terminal** dan foydalaning.

### 8. Storage link yaratish

```bash
cd /home/USERNAME/rova_uc
php artisan storage:link
```

Bu `storage/app/public` papkasini `public_html/storage` ga bog'laydi.

---

## Tekshirish

- [ ] `https://DOMENINGIZ.COM` ochiladi
- [ ] Login qilish ishlaydi
- [ ] Rasmlar ko'rinadi
- [ ] To'lov tizimi ishlaydi (Click)
- [ ] Telegram bot ishlaydi

---

## Muhim Eslatmalar

### Queue (Navbat) haqida
`QUEUE_CONNECTION=sync` qilib qo'yilgan — bu shared hosting uchun to'g'ri.
Joblar darhol bajariladi, daemon kerak emas.

### Telegram Bot haqida
`bot/polling.php` daemon sifatida shared hostingda ishlamaydi.
Agar bot polling kerak bo'lsa, cPanel → **Cron Jobs** da qo'shing:
```
* * * * * /usr/bin/php /home/USERNAME/rova_uc/bot/polling.php >> /dev/null 2>&1
```

### SSL haqida
`.env` da `SESSION_SECURE_COOKIE=true` qilib qo'yilgan.
Saytingizda **HTTPS** bo'lishi shart. ahost cPanel → **SSL/TLS** → Let's Encrypt orqali bepul SSL oling.

### Debug mode
`APP_DEBUG=false` — production da xatolar foydalanuvchilarga ko'rsatilmaydi.
Xatolarni `/home/USERNAME/rova_uc/storage/logs/laravel.log` dan ko'rish mumkin.

---

## Muammolar

**"No application encryption key" xatosi:**
```bash
php artisan key:generate
```

**500 Server Error:**
```bash
cat /home/USERNAME/rova_uc/storage/logs/laravel.log | tail -50
```

**Rasm/fayl ko'rinmayapti:**
```bash
php artisan storage:link
```
