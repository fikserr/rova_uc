import { Head, Link } from "@inertiajs/react";
import { ArrowLeft, ShieldCheck } from "lucide-react";

const sections = [
    {
        title: "1. Umumiy qoidalar",
        content:
            "Ushbu Maxfiylik siyosati @VallerGame_bot Telegram Mini App orqali taqdim etiladigan top-up xizmatidan foydalanuvchilarning shaxsiy ma'lumotlari qanday yig'ilishi, ishlatilishi, saqlanishi va himoya qilinishini belgilaydi. Xizmatdan foydalanish orqali Siz ushbu Siyosat shartlariga rozilik bildirasiz.",
    },
    {
        title: "2. Qanday ma'lumotlar yig'iladi",
        groups: [
            {
                label: "2.1. Telegram orqali avtomatik olinadigan",
                list: [
                    "Telegram foydalanuvchi ID raqami (user ID)",
                    "Telegram foydalanuvchi nomi (username)",
                    "Ism va familiya (agar Telegram profilida ko'rsatilgan bo'lsa)",
                    "Profil rasmi (agar mavjud va ochiq bo'lsa)",
                    "Til sozlamalari",
                ],
            },
            {
                label: "2.2. Akkaunt va aloqa ma'lumotlari",
                list: [
                    "O'yin ichidagi hisob ID raqami yoki login ma'lumotlari",
                    "Telefon raqami (ro'yxatdan o'tish yoki to'lov talab qilganda)",
                    "Sessiya tokeni, kirish urinishlari jurnali, IP-manzil",
                ],
            },
            {
                label: "2.3. To'lov ma'lumotlari",
                note: "Xizmat bank kartasi raqamlari yoki CVV kodlarini saqlamaydi. To'lovlar Payme, Click va boshqa litsenziyalangan provayderlar orqali amalga oshiriladi. Xizmat faqat tranzaksiya ID, summasi va holatini saqlaydi.",
            },
            {
                label: "2.4. Texnik ma'lumotlar",
                list: [
                    "Qurilma turi va operatsion tizim, ilova versiyasi",
                    "IP-manzil, foydalanuvchi agenti (user agent)",
                    "Xizmatdan foydalanish vaqti va faoliyat jurnali",
                ],
            },
        ],
    },
    {
        title: "3. Ma'lumotlardan foydalanish maqsadlari",
        items: [
            "Buyurtma qilingan top-up xizmatini bajarish",
            "To'lov operatsiyalarini tasdiqlash va kuzatish",
            "Foydalanuvchini identifikatsiya qilish va firibgarlikning oldini olish",
            "Texnik yordam va mijozlar bilan aloqa",
            "Xizmat sifatini yaxshilash va statistik tahlil",
            "Muhim bildirishnomalar yuborish (to'lov holati, xavfsizlik ogohlantirishlari)",
            "Qonun hujjatlari talablarini bajarish",
        ],
    },
    {
        title: "4. Aloqa kanallari va bildirishnomalar",
        items: [
            "Foydalanuvchi bilan aloqa @VallerGame_bot, push-bildirishnomalar, telefon yoki email orqali amalga oshiriladi.",
            "Tranzaksiya holati va xavfsizlikka oid xabarlar Xizmatning ajralmas qismi bo'lib, ulardan voz kechish mumkin emas.",
            "Aksiya/promo bildirishnomalarini sozlamalar orqali o'chirish mumkin (agar funksiya mavjud bo'lsa).",
        ],
    },
    {
        title: "5. Ma'lumotlarni uchinchi tomonlarga uzatish",
        items: [
            "To'lov provayderlari — tranzaksiyani amalga oshirish uchun (Payme, Click va h.k.)",
            "O'yin platformalari/serverlari — top-up xizmatini bajarish uchun zarur hisob ma'lumotlari doirasida",
            "Infratuzilma provayderlari — server, bulutli xotira, push-bildirishnoma xizmatlari uchun",
            "Vakolatli davlat organlari — qonuniy talablar asosida, jumladan moliyaviy monitoring doirasida",
        ],
        note: "Xizmat shaxsiy ma'lumotlarni marketing maqsadida uchinchi tomonlarga sotmaydi.",
    },
    {
        title: "6. Ma'lumotlarni saqlash va xavfsizlik",
        items: [
            "Ma'lumotlar Xizmat ko'rsatish va qonuniy majburiyatlarni bajarish uchun zarur muddat davomida saqlanadi.",
            "Ma'lumotlarni himoya qilish uchun shifrlash, cheklangan kirish huquqi va xavfsizlik jurnallari qo'llaniladi.",
            "Foydalanuvchi o'z PIN-kodi, paroli va qurilmasi maxfiyligini saqlash uchun shaxsan mas'uldir.",
        ],
    },
    {
        title: "7. Foydalanuvchi huquqlari",
        items: [
            "O'z haqidagi ma'lumotlarni ko'rish va nusxasini olish",
            "Noto'g'ri ma'lumotlarni tuzatishni talab qilish",
            "Ma'lumotlarni o'chirishni talab qilish (qonuniy majburiyatlarga zid bo'lmasa)",
            "Ma'lumotlardan foydalanishga bergan roziligini istalgan vaqtda qaytarib olish",
            "Aksiya/promo bildirishnomalaridan voz kechish",
            "Yuqoridagi masalalar bo'yicha @VallerGame_bot orqali murojaat qilish",
        ],
    },
    {
        title: "8. Cookie va texnik mexanizmlar",
        content:
            "Telegram Mini App muhitida Xizmat sessiya ma'lumotlarini saqlash uchun Telegram tomonidan taqdim etilgan mexanizmlardan (initData, local storage) foydalanishi mumkin. Bu ma'lumotlar faqat Xizmat ichida foydalanuvchi tajribasini yaxshilash uchun ishlatiladi.",
    },
    {
        title: "9. Bolalar maxfiyligi va yosh chegarasi",
        items: [
            "Xizmatdan foydalanish uchun minimal yosh 14 yosh hisoblanadi.",
            "14 yoshdan kichik shaxslarning ma'lumotlari bilib qasddan yig'ilmaydi; aniqlansa tegishli ma'lumotlar o'chiriladi.",
            "14–18 yoshdagi Foydalanuvchilar Xizmatdan ota-ona nazorati ostida foydalanishlari tavsiya etiladi.",
        ],
    },
    {
        title: "10. Siyosatga o'zgartirishlar",
        content:
            "Ushbu Siyosat vaqti-vaqti bilan yangilanishi mumkin. Muhim o'zgarishlar haqida Telegram bot orqali xabar beriladi. Yangilangan Siyosatning kuchga kirish sanasi sahifa yuqorida ko'rsatiladi.",
    },
];

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4">
            <Head title="Maxfiylik siyosati — VallerGame" />

            <div className="max-w-3xl mx-auto">
                {/* Back */}
                <Link
                    href="/login"
                    className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 mb-6 transition-colors"
                >
                    <ArrowLeft className="size-4" />
                    Orqaga
                </Link>

                {/* Header */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 mb-6">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
                            <ShieldCheck className="size-6 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                                Maxfiylik Siyosati
                            </h1>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Privacy Policy — @VallerGame_bot
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-4 text-xs text-slate-500 dark:text-slate-400 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                        <span>Xizmat: @VallerGame_bot</span>
                        <span>•</span>
                        <span>O'zbekiston Respublikasi qonunchiligi asosida</span>
                    </div>
                </div>

                {/* Sections */}
                <div className="space-y-4">
                    {sections.map((section, i) => (
                        <div
                            key={i}
                            className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6"
                        >
                            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">
                                {section.title}
                            </h2>

                            {section.content && (
                                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                    {section.content}
                                </p>
                            )}

                            {section.items && (
                                <div className="space-y-2.5">
                                    {section.items.map((item, j) => (
                                        <div key={j} className="flex gap-3">
                                            <span className="mt-2 size-1.5 rounded-full bg-emerald-500 shrink-0" />
                                            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                                {item}
                                            </p>
                                        </div>
                                    ))}
                                    {section.note && (
                                        <div className="mt-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-3 text-sm text-emerald-700 dark:text-emerald-300">
                                            {section.note}
                                        </div>
                                    )}
                                </div>
                            )}

                            {section.groups && (
                                <div className="space-y-4">
                                    {section.groups.map((group, j) => (
                                        <div key={j}>
                                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                                {group.label}
                                            </p>
                                            {group.note ? (
                                                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3 text-sm text-amber-700 dark:text-amber-300">
                                                    {group.note}
                                                </div>
                                            ) : (
                                                <div className="space-y-1.5 pl-3">
                                                    {group.list?.map((li, k) => (
                                                        <div key={k} className="flex gap-2">
                                                            <span className="mt-2 size-1.5 rounded-full bg-slate-400 shrink-0" />
                                                            <p className="text-sm text-slate-600 dark:text-slate-300">
                                                                {li}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Contact */}
                <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-800/30 p-6 mt-4">
                    <h2 className="text-base font-bold text-slate-900 dark:text-white mb-3">
                        11. Aloqa
                    </h2>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">
                        Maxfiylik siyosati yuzasidan savollar bo'lsa:
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                        Telegram:{" "}
                        <span className="font-medium text-emerald-600 dark:text-emerald-400">
                            @VallerGame_bot
                        </span>
                    </p>
                </div>

                {/* Footer link */}
                <div className="text-center mt-6 text-sm text-slate-400 dark:text-slate-500">
                    <Link href="/terms" className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                        ← Foydalanish shartlari
                    </Link>
                </div>
            </div>
        </div>
    );
}
