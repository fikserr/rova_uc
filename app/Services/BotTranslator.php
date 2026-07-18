<?php

namespace App\Services;

class BotTranslator
{
    private string $lang;

    private static array $strings = [
        'uz' => [
            // /start
            'need_username'     => "⚠️ <b>Username kerak</b>\n\nIlovadan foydalanish uchun Telegram username o'rnatilgan bo'lishi shart.\n\n<b>Qanday qilish:</b>\nSozlamalar → Profilni tahrirlash → Username kiriting → /start yuboring.",
            'need_phone'        => "👋 <b>Assalomu alaykum!</b>\n\n<b>VallerGame</b>ga xush kelibsiz — O'zbekistondagi eng qulay gaming top-up xizmati 🎮\n\nDavom etish uchun quyidagi tugma orqali telefon raqamingizni yuboring:",
            'phone_button'      => "📱 Telefon raqamni yuborish",
            'wrong_contact'     => "⚠️ Iltimos, <b>o'zingizning</b> telefon raqamingizni yuboring.",
            'registered'        => "🎉 <b>Ro'yxatdan muvaffaqiyatli o'tdingiz!</b>\n\nSiz <b>VallerGame</b> jamoasiga qo'shildingiz.\n\n🎮 PUBG, Mobile Legends, Free Fire va boshqa ko'plab o'yinlar uchun top-up xizmatini eng qulay narxlarda toping.\n\n👇 Ilovani ochish uchun tugmani bosing:",
            'open_app'          => "🚀 VallerGame — Ilovani ochish",
            'welcome_back'      => "👋 <b>Xush kelibsiz!</b>\n\n💰 Balans: <b>%s so'm</b>\n\n🎮 O'yiningizni tanlang va top-up qiling:",
            'balance'           => "💰 Balans: <b>%s so'm</b>",

            // Worker
            'worker_greeting'   => "👷 <b>Worker Panel — VallerGame</b>\n\nYangi buyurtma yoki to'lov cheki kelganda shu yerda bildirishnoma olasiz.\n\nIshga tayyor! ✅",

            // Reseller menu
            'rs_menu'           => "🏪 <b>Reseller Panel</b>\n\n💳 Balans: <b>%s UZS</b>\n\nO'yin tanlang va buyurtma bering:",
            'rs_buy_order'      => "🎮 Buyurtma berish",
            'rs_my_orders'      => "📋 Buyurtmalarim",
            'rs_top_up'         => "💳 Balansni to'ldirish",

            // Reseller games
            'rs_select_game'    => "🎮 <b>O'yin tanlang:</b>",
            'rs_no_products'    => "⚠️ Hozircha reseller narxlar belgilanmagan.\nAdmin bilan bog'laning.",
            'rs_game_products'  => "📦 <b>%s</b> — mavjud mahsulotlar:",
            'rs_game_no_items'  => "⚠️ Bu o'yin uchun hozircha mahsulot mavjud emas.",

            // Reseller buy
            'rs_enter_player'   => "🛒 <b>%s</b>\n📦 %s\n💰 Narx: <b>%s UZS</b>\n\n👤 <b>Player ID</b>ni kiriting:",
            'rs_enter_zone'     => "🌐 <b>Server / Zone ID</b>ni kiriting:\n<i>Masalan: 1234</i>",
            'rs_no_balance'     => "💳 <b>Balans yetarli emas</b>\n\nMavjud: <b>%s UZS</b>\nKerak: <b>%s UZS</b>\nYetishmaydi: <b>%s UZS</b>\n\nBalansni to'ldiring va qaytadan urinib ko'ring.",
            'rs_order_ok'       =>
                "✅ <b>Buyurtma qabul qilindi!</b>\n\n" .
                "🎮 %s — %s\n" .
                "👤 Player ID: <code>%s</code>%s\n" .
                "💰 To'landi: <b>%s UZS</b>\n" .
                "💚 Tejaldi: <b>%s UZS</b>\n" .
                "🔖 Buyurtma: <code>SK-%d</code>\n\n" .
                "Resurs tez orada hisobingizga tushadi.",
            'rs_order_fail'     => "❌ <b>Buyurtma amalga oshmadi</b>\n\nBalans qaytarildi.\n<i>Sabab: %s</i>",
            'rs_order_err'      => "❌ <b>Xatolik yuz berdi</b>\n\nBalans qaytarildi. Qaytadan urinib ko'ring.",
            'rs_orders_title'   => "📋 <b>So'nggi buyurtmalar:</b>\n\n",
            'rs_no_orders'      => "📋 Hali birorta buyurtma yo'q.\n\nBirinchi buyurtmangizni bering! 🎮",
            'rs_back_menu'      => "🔙 Bosh menyu",
            'rs_back_games'     => "🔙 O'yinlar",
            'rs_my_orders_btn'  => "📋 Buyurtmalarim",

            // Statuses
            'status_completed'  => "✅ Bajarildi",
            'status_processing' => "⏳ Jarayonda",
            'status_pending'    => "🕐 Kutilmoqda",
            'status_canceled'   => "❌ Bekor qilindi",
            'status_failed'     => "❌ Xato",
            'status_delivered'  => "✅ Yetkazildi",
        ],
        'ru' => [
            'need_username'     => "⚠️ <b>Требуется username</b>\n\nДля использования приложения необходим Telegram username.\n\n<b>Как добавить:</b>\nНастройки → Изменить профиль → Введите username → Отправьте /start.",
            'need_phone'        => "👋 <b>Добро пожаловать!</b>\n\nВас приветствует <b>VallerGame</b> — лучший сервис игрового пополнения в Узбекистане 🎮\n\nДля продолжения отправьте номер телефона:",
            'phone_button'      => "📱 Отправить номер телефона",
            'wrong_contact'     => "⚠️ Пожалуйста, отправьте <b>свой</b> номер телефона.",
            'registered'        => "🎉 <b>Регистрация успешно завершена!</b>\n\nВы присоединились к команде <b>VallerGame</b>.\n\n🎮 PUBG, Mobile Legends, Free Fire и другие игры — пополнение по лучшим ценам.\n\n👇 Нажмите кнопку, чтобы открыть приложение:",
            'open_app'          => "🚀 VallerGame — Открыть приложение",
            'welcome_back'      => "👋 <b>Добро пожаловать!</b>\n\n💰 Баланс: <b>%s сум</b>\n\n🎮 Выберите игру и пополните счёт:",
            'balance'           => "💰 Баланс: <b>%s сум</b>",

            'worker_greeting'   => "👷 <b>Worker Panel — VallerGame</b>\n\nВы получите уведомление при поступлении нового заказа или чека.\n\nГотов к работе! ✅",

            'rs_menu'           => "🏪 <b>Reseller Panel</b>\n\n💳 Баланс: <b>%s UZS</b>\n\nВыберите игру и оформите заказ:",
            'rs_buy_order'      => "🎮 Сделать заказ",
            'rs_my_orders'      => "📋 Мои заказы",
            'rs_top_up'         => "💳 Пополнить баланс",

            'rs_select_game'    => "🎮 <b>Выберите игру:</b>",
            'rs_no_products'    => "⚠️ Reseller цены пока не установлены.\nСвяжитесь с администратором.",
            'rs_game_products'  => "📦 <b>%s</b> — доступные товары:",
            'rs_game_no_items'  => "⚠️ Для этой игры товары пока недоступны.",

            'rs_enter_player'   => "🛒 <b>%s</b>\n📦 %s\n💰 Цена: <b>%s UZS</b>\n\n👤 Введите <b>Player ID</b>:",
            'rs_enter_zone'     => "🌐 Введите <b>Server / Zone ID</b>:\n<i>Например: 1234</i>",
            'rs_no_balance'     => "💳 <b>Недостаточно средств</b>\n\nДоступно: <b>%s UZS</b>\nНеобходимо: <b>%s UZS</b>\nНе хватает: <b>%s UZS</b>\n\nПополните баланс и попробуйте снова.",
            'rs_order_ok'       =>
                "✅ <b>Заказ принят!</b>\n\n" .
                "🎮 %s — %s\n" .
                "👤 Player ID: <code>%s</code>%s\n" .
                "💰 Оплачено: <b>%s UZS</b>\n" .
                "💚 Экономия: <b>%s UZS</b>\n" .
                "🔖 Заказ: <code>SK-%d</code>\n\n" .
                "Ресурс скоро поступит на ваш счёт.",
            'rs_order_fail'     => "❌ <b>Заказ не выполнен</b>\n\nБаланс возвращён.\n<i>Причина: %s</i>",
            'rs_order_err'      => "❌ <b>Произошла ошибка</b>\n\nБаланс возвращён. Попробуйте снова.",
            'rs_orders_title'   => "📋 <b>Последние заказы:</b>\n\n",
            'rs_no_orders'      => "📋 Заказов пока нет.\n\nОформите первый заказ! 🎮",
            'rs_back_menu'      => "🔙 Главное меню",
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
            'need_username'     => "⚠️ <b>Username required</b>\n\nA Telegram username is needed to use this app.\n\n<b>How to add one:</b>\nSettings → Edit Profile → Set username → Send /start.",
            'need_phone'        => "👋 <b>Welcome!</b>\n\n<b>VallerGame</b> — your go-to gaming top-up service 🎮\n\nPlease share your phone number to continue:",
            'phone_button'      => "📱 Share my phone number",
            'wrong_contact'     => "⚠️ Please share <b>your own</b> phone number.",
            'registered'        => "🎉 <b>You're all set!</b>\n\nWelcome to <b>VallerGame</b>.\n\n🎮 Top up PUBG, Mobile Legends, Free Fire and more — at the best prices.\n\n👇 Tap the button below to open the app:",
            'open_app'          => "🚀 VallerGame — Open App",
            'welcome_back'      => "👋 <b>Welcome back!</b>\n\n💰 Balance: <b>%s UZS</b>\n\n🎮 Pick a game and top up:",
            'balance'           => "💰 Balance: <b>%s UZS</b>",

            'worker_greeting'   => "👷 <b>Worker Panel — VallerGame</b>\n\nYou'll be notified when a new order or payment receipt arrives.\n\nReady to work! ✅",

            'rs_menu'           => "🏪 <b>Reseller Panel</b>\n\n💳 Balance: <b>%s UZS</b>\n\nSelect a game and place your order:",
            'rs_buy_order'      => "🎮 Place Order",
            'rs_my_orders'      => "📋 My Orders",
            'rs_top_up'         => "💳 Top Up Balance",

            'rs_select_game'    => "🎮 <b>Select a game:</b>",
            'rs_no_products'    => "⚠️ No reseller prices set yet.\nContact the admin.",
            'rs_game_products'  => "📦 <b>%s</b> — available products:",
            'rs_game_no_items'  => "⚠️ No products available for this game yet.",

            'rs_enter_player'   => "🛒 <b>%s</b>\n📦 %s\n💰 Price: <b>%s UZS</b>\n\n👤 Enter your <b>Player ID</b>:",
            'rs_enter_zone'     => "🌐 Enter <b>Server / Zone ID</b>:\n<i>Example: 1234</i>",
            'rs_no_balance'     => "💳 <b>Insufficient balance</b>\n\nAvailable: <b>%s UZS</b>\nRequired: <b>%s UZS</b>\nShort by: <b>%s UZS</b>\n\nTop up your balance and try again.",
            'rs_order_ok'       =>
                "✅ <b>Order placed!</b>\n\n" .
                "🎮 %s — %s\n" .
                "👤 Player ID: <code>%s</code>%s\n" .
                "💰 Paid: <b>%s UZS</b>\n" .
                "💚 Saved: <b>%s UZS</b>\n" .
                "🔖 Order: <code>SK-%d</code>\n\n" .
                "Your resource will be delivered shortly.",
            'rs_order_fail'     => "❌ <b>Order failed</b>\n\nBalance refunded.\n<i>Reason: %s</i>",
            'rs_order_err'      => "❌ <b>Something went wrong</b>\n\nBalance refunded. Please try again.",
            'rs_orders_title'   => "📋 <b>Recent orders:</b>\n\n",
            'rs_no_orders'      => "📋 No orders yet.\n\nPlace your first order! 🎮",
            'rs_back_menu'      => "🔙 Main menu",
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
