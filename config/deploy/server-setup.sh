#!/usr/bin/env bash
# server-setup.sh — Yangi Ubuntu 22.04/24.04 VPS uchun bir martalik setup
# Root yoki sudo huquqi bilan ishlatiladi

set -euo pipefail

DOMAIN="yourdomain.com"           # <- o'zgartiring
DB_NAME="rova_uc"
DB_USER="rova_user"
DB_PASS="$(openssl rand -base64 24)"
PROJECT_DIR="/var/www/rova_uc"
PHP_VER="8.3"

echo "============================================"
echo " RovaUC Server Setup"
echo "============================================"

# ── 1. Paketlarni yangilash ──────────────────────────────────────
echo "[1/8] System update..."
apt-get update -qq && apt-get upgrade -y -qq

# ── 2. PHP + Nginx + Supervisor ──────────────────────────────────
echo "[2/8] Installing PHP ${PHP_VER}, Nginx, Supervisor..."
add-apt-repository -y ppa:ondrej/php > /dev/null 2>&1
apt-get update -qq
apt-get install -y -qq \
    nginx \
    supervisor \
    certbot python3-certbot-nginx \
    php${PHP_VER}-fpm \
    php${PHP_VER}-cli \
    php${PHP_VER}-mysql \
    php${PHP_VER}-mbstring \
    php${PHP_VER}-xml \
    php${PHP_VER}-bcmath \
    php${PHP_VER}-curl \
    php${PHP_VER}-zip \
    php${PHP_VER}-gd \
    php${PHP_VER}-intl \
    php${PHP_VER}-redis \
    mysql-server \
    nodejs \
    npm \
    git \
    curl \
    unzip

# ── 3. Composer ──────────────────────────────────────────────────
echo "[3/8] Installing Composer..."
curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# ── 4. MySQL sozlash ─────────────────────────────────────────────
echo "[4/8] Configuring MySQL..."
mysql -e "CREATE DATABASE IF NOT EXISTS ${DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -e "CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASS}';"
mysql -e "GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO '${DB_USER}'@'localhost';"
mysql -e "FLUSH PRIVILEGES;"
echo "  DB_USER=${DB_USER}"
echo "  DB_PASS=${DB_PASS}  <-- SAQLANG!"

# ── 5. Loyihani klonlash ─────────────────────────────────────────
echo "[5/8] Cloning project..."
mkdir -p "${PROJECT_DIR}"
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git "${PROJECT_DIR}"  # <- o'zgartiring
chown -R www-data:www-data "${PROJECT_DIR}"
chmod -R 775 "${PROJECT_DIR}/storage" "${PROJECT_DIR}/bootstrap/cache"

# ── 6. Nginx konfiguratsiyasi ────────────────────────────────────
echo "[6/8] Configuring Nginx..."
cp "${PROJECT_DIR}/config/deploy/nginx.conf" "/etc/nginx/sites-available/rova_uc"
sed -i "s/yourdomain.com/${DOMAIN}/g" /etc/nginx/sites-available/rova_uc
ln -sf /etc/nginx/sites-available/rova_uc /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

# SSL (Let's Encrypt)
certbot --nginx -d "${DOMAIN}" --non-interactive --agree-tos -m "admin@${DOMAIN}" || \
    echo "  WARN: SSL sertifikat olishda xato. Keyinroq: certbot --nginx -d ${DOMAIN}"

# ── 7. Supervisor (polling bot) ──────────────────────────────────
echo "[7/8] Configuring Supervisor..."
sed -i "s|/var/www/rova_uc|${PROJECT_DIR}|g" "${PROJECT_DIR}/config/deploy/supervisor-polling-bot.conf"
cp "${PROJECT_DIR}/config/deploy/supervisor-polling-bot.conf" /etc/supervisor/conf.d/
supervisorctl reread
supervisorctl update

# ── 8. Tayyor ────────────────────────────────────────────────────
echo "[8/8] Done!"
echo ""
echo "============================================"
echo "KEYINGI QADAMLAR:"
echo "============================================"
echo "1. .env faylini yarating:"
echo "   cp ${PROJECT_DIR}/.env.example ${PROJECT_DIR}/.env"
echo "   nano ${PROJECT_DIR}/.env"
echo "   # APP_KEY, DB_PASSWORD=${DB_PASS}, TELEGRAM_BOT_TOKEN, ..."
echo ""
echo "2. Deploy skripty ishga tushiring:"
echo "   cd ${PROJECT_DIR} && bash deploy.sh"
echo ""
echo "3. Polling botni ishga tushiring:"
echo "   supervisorctl start rova-polling-bot"
echo "   supervisorctl status"
echo "============================================"
