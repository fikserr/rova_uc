<?php

namespace App\Services;

class BotTranslator
{
    private string $lang;

    private static array $strings = [
        'uz' => [
            // /start
            'need_username'     => "❗ Ilovadan foydalanish uchun Telegram username kerak.\n\nSozlamalar → Profilni tahrirlash → Username qo'shing, keyin /start bosing.",
            'need_phone'        => "👋 Assalomu alaykum!\n\nDavom etish uchun telefon raqamingizni yuboring 👇",
            'phone_button'      => "📱 Telefon raqamni yuborish",
            'wrong_contact'     => "⚠️ Iltimos, o'zingizning telefon raqamingizni yuboring.",
            'registered'        => "✅ Ro'yxatdan muvaffaqiyatli o'tdingiz!",
            'open_app'          => "🛒 Ilovani ochish",
            'welcome_back'      => "👋 Xush kelibsiz!\n\n💰 Balansingiz: <b>%s so'm</b>",
            'balance'           => "💰 Balansingiz: <b>%s so'm</b>",

            // Worker
            'worker_greeting'   => "👷 <b>Worker panel</b>\n\nYangi buyurtma yoki chek kelganda bu yerda bildirishnoma olasiz.",

            // Reseller menu
            'rs_menu'           => "🏪 <b>Reseller Panel</b>\n\n💳 Balans: <b>%s UZS</b>\n\n👇 Buyurtma berish uchun o'yin tanlang:",
            'rs_buy_order'      => "🎮 Buyurtma berish",
            'rs_my_orders'      => "📋 So'nggi buyurtmalar",
            'rs_top_up'         => "💳 Balansni to'ldirish",

            // Reseller games
            'rs_select_game'    => "🎮 <b>O'yin tanlang:</b>",
            'rs_no_products'    => "❌ Reseller narxlar belgilanmagan.\nAdmin bilan bog'laning.",
            'rs_game_products'  => "📦 <b>%s</b> mahsulotlari:",
            'rs_game_no_items'  => "❌ Bu o'yin uchun mahsulotlar yo'q.",

            // Reseller buy
            'rs_enter_player'   => "🛒 <b>%s</b> — %s\n💰 Narx: <b>%s UZS</b>\n\n👤 <b>Player ID</b> kiriting:",
            'rs_enter_zone'     => "🌐 <b>Server / Zone ID</b> kiriting:\n<i>Masalan: 1234</i>",
            'rs_no_balance'     => "❌ <b>Balans yetarli emas</b>\n\n💳 Balansingiz: <b>%s UZS</b>\n💰 Kerak: <b>%s UZS</b>\n➕ Yetishmaydi: <b>%s UZS</b>",
            'rs_order_ok'       =>
                "✅ <b>Buyurtma qabul qilindi!</b>\n\n" .
                "🎮 %s — %s\n" .
                "👤 Player ID: <code>%s</code>%s\n" .
                "💰 To'landi: <b>%s UZS</b>\n" .
                "💚 Tejaldi: <b>%s UZS</b>\n" .
                "🔖 Raqam: <code>SK-%d</code>",
            'rs_order_fail'     => "❌ <b>Buyurtma yuborishda xatolik.</b>\nBalans qaytarildi.\n\n<i>%s</i>",
            'rs_order_err'      => "❌ Xatolik yuz berdi. Balans qaytarildi.",
            'rs_orders_title'   => "📋 <b>So'nggi buyurtmalar:</b>\n\n",
            'rs_no_orders'      => "📋 Hali buyurtma yo'q.",
            'rs_back_menu'      => "🔙 Menyu",
            'rs_back_games'     => "🔙 O'yinlar",
            'rs_my_orders_btn'  => "📋 Buyurtmalarim",

            // Statuses
            'status_completed'  => "✅ Bajarildi",
            'status_processing' => "⏳ Jarayonda",
            'status_pending'    => "🕐 Kutilmoqda",
            'status_canceled'   => "❌ Bekor",
            'status_failed'     => "❌ Xato",
            'status_delivered'  => "✅ Yetkazildi",
        ],
        'ru' => [
            'need_username'     => "❗ Для использования приложения нужен Telegram username.\n\nНастройки → Изменить профиль → Добавьте username, затем нажмите /start.",
            'need_phone'        => "👋 Добро пожаловать!\n\nОтправьте номер телефона для продолжения 👇",
            'phone_button'      => "📱 Отправить номер телефона",
            'wrong_contact'     => "⚠️ Пожалуйста, отправьте свой номер телефона.",
            'registered'        => "✅ Регистрация прошла успешно!",
            'open_app'          => "🛒 Открыть приложение",
            'welcome_back'      => "👋 Добро пожаловать!\n\n💰 Ваш баланс: <b>%s сум</b>",
            'balance'           => "💰 Ваш баланс: <b>%s сум</b>",

            'worker_greeting'   => "👷 <b>Worker panel</b>\n\nВы получите уведомление при поступлении нового заказа или чека.",

            'rs_menu'           => "🏪 <b>Reseller Panel</b>\n\n💳 Баланс: <b>%s UZS</b>\n\n👇 Выберите игру для заказа:",
            'rs_buy_order'      => "🎮 Сделать заказ",
            'rs_my_orders'      => "📋 Последние заказы",
            'rs_top_up'         => "💳 Пополнить баланс",

            'rs_select_game'    => "🎮 <b>Выберите игру:</b>",
            'rs_no_products'    => "❌ Reseller цены не установлены.\nСвяжитесь с администратором.",
            'rs_game_products'  => "📦 Товары <b>%s</b>:",
            'rs_game_no_items'  => "❌ Для этой игры товары не найдены.",

            'rs_enter_player'   => "🛒 <b>%s</b> — %s\n💰 Цена: <b>%s UZS</b>\n\n👤 Введите <b>Player ID</b>:",
            'rs_enter_zone'     => "🌐 Введите <b>Server / Zone ID</b>:\n<i>Например: 1234</i>",
            'rs_no_balance'     => "❌ <b>Недостаточно средств</b>\n\n💳 Ваш баланс: <b>%s UZS</b>\n💰 Необходимо: <b>%s UZS</b>\n➕ Не хватает: <b>%s UZS</b>",
            'rs_order_ok'       =>
                "✅ <b>Заказ принят!</b>\n\n" .
                "🎮 %s — %s\n" .
                "👤 Player ID: <code>%s</code>%s\n" .
                "💰 Оплачено: <b>%s UZS</b>\n" .
                "💚 Экономия: <b>%s UZS</b>\n" .
                "🔖 Заказ: <code>SK-%d</code>",
            'rs_order_fail'     => "❌ <b>Ошибка при отправке заказа.</b>\nБаланс возвращён.\n\n<i>%s</i>",
            'rs_order_err'      => "❌ Произошла ошибка. Баланс возвращён.",
            'rs_orders_title'   => "📋 <b>Последние заказы:</b>\n\n",
            'rs_no_orders'      => "📋 Заказов пока нет.",
            'rs_back_menu'      => "🔙 Меню",
            'rs_back_games'     => "🔙 Игры",
            'rs_my_orders_btn'  => "📋 Мои заказы",

            'status_completed'  => "✅ Выполнен",
            'status_processing' => "⏳ В процессе",
            'status_pending'    => "🕐 Ожидает",
            'status_canceled'   => "❌ Отменён",
            'status_failed'     => "❌ Ошибка",
            'status_delivered'  => "✅ Доставлен",
        ],
        'en' => [
            'need_username'     => "❗ A Telegram username is required to use the app.\n\nSettings → Edit Profile → Add a username, then press /start.",
            'need_phone'        => "👋 Welcome!\n\nPlease share your phone number to continue 👇",
            'phone_button'      => "📱 Share phone number",
            'wrong_contact'     => "⚠️ Please share your own phone number.",
            'registered'        => "✅ Successfully registered!",
            'open_app'          => "🛒 Open App",
            'welcome_back'      => "👋 Welcome back!\n\n💰 Your balance: <b>%s UZS</b>",
            'balance'           => "💰 Your balance: <b>%s UZS</b>",

            'worker_greeting'   => "👷 <b>Worker panel</b>\n\nYou'll get notified when a new order or receipt arrives.",

            'rs_menu'           => "🏪 <b>Reseller Panel</b>\n\n💳 Balance: <b>%s UZS</b>\n\n👇 Select a game to place an order:",
            'rs_buy_order'      => "🎮 Place Order",
            'rs_my_orders'      => "📋 Recent Orders",
            'rs_top_up'         => "💳 Top Up Balance",

            'rs_select_game'    => "🎮 <b>Select a game:</b>",
            'rs_no_products'    => "❌ No reseller prices set.\nContact admin.",
            'rs_game_products'  => "📦 <b>%s</b> products:",
            'rs_game_no_items'  => "❌ No products found for this game.",

            'rs_enter_player'   => "🛒 <b>%s</b> — %s\n💰 Price: <b>%s UZS</b>\n\n👤 Enter your <b>Player ID</b>:",
            'rs_enter_zone'     => "🌐 Enter <b>Server / Zone ID</b>:\n<i>Example: 1234</i>",
            'rs_no_balance'     => "❌ <b>Insufficient balance</b>\n\n💳 Your balance: <b>%s UZS</b>\n💰 Required: <b>%s UZS</b>\n➕ Short by: <b>%s UZS</b>",
            'rs_order_ok'       =>
                "✅ <b>Order placed!</b>\n\n" .
                "🎮 %s — %s\n" .
                "👤 Player ID: <code>%s</code>%s\n" .
                "💰 Paid: <b>%s UZS</b>\n" .
                "💚 Saved: <b>%s UZS</b>\n" .
                "🔖 Order: <code>SK-%d</code>",
            'rs_order_fail'     => "❌ <b>Failed to place order.</b>\nBalance refunded.\n\n<i>%s</i>",
            'rs_order_err'      => "❌ An error occurred. Balance refunded.",
            'rs_orders_title'   => "📋 <b>Recent orders:</b>\n\n",
            'rs_no_orders'      => "📋 No orders yet.",
            'rs_back_menu'      => "🔙 Menu",
            'rs_back_games'     => "🔙 Games",
            'rs_my_orders_btn'  => "📋 My Orders",

            'status_completed'  => "✅ Completed",
            'status_processing' => "⏳ Processing",
            'status_pending'    => "🕐 Pending",
            'status_canceled'   => "❌ Canceled",
            'status_failed'     => "❌ Failed",
            'status_delivered'  => "✅ Delivered",
        ],
    ];

    public function __construct(string $lang = 'uz')
    {
        $this->lang = in_array($lang, ['uz', 'ru', 'en'], true) ? $lang : 'uz';
    }

    public function get(string $key, mixed ...$args): string
    {
        $str = self::$strings[$this->lang][$key]
            ?? self::$strings['uz'][$key]
            ?? $key;

        return $args ? sprintf($str, ...$args) : $str;
    }

    public function statusText(string $status): string
    {
        $key = 'status_' . $status;
        return self::$strings[$this->lang][$key]
            ?? self::$strings['uz'][$key]
            ?? $status;
    }
}
