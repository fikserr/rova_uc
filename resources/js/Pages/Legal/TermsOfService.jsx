import { Head, Link } from "@inertiajs/react";
import { ArrowLeft, FileText } from "lucide-react";

const sections = [
    {
        title: "1. Umumiy qoidalar",
        items: [
            "Ushbu hujjat @VallerGame_bot Telegram Mini App hamda kelgusida ishga tushiriladigan mobil ilova orqali turli onlayn o'yinlarga top-up (hisobni to'ldirish) xizmatini ko'rsatuvchi «VallerGame» (keyingi o'rinlarda — «Xizmat» yoki «Ijrochi») bilan Xizmatdan foydalanuvchi shaxs («Foydalanuvchi» yoki «Mijoz») o'rtasidagi munosabatlarni tartibga soladi.",
            "Ushbu hujjat O'zbekiston Respublikasi Fuqarolik kodeksiga muvofiq ommaviy oferta hisoblanadi. Foydalanuvchi Xizmatdan foydalanishni boshlash (ro'yxatdan o'tish, buyurtma berish, to'lov amalga oshirish) orqali ushbu shartlarni to'liq va so'zsiz qabul qiladi (aksept).",
            "Xizmat @VallerGame_bot nomli Telegram bot/mini-app orqali ko'rsatiladi va turli video o'yinlar uchun ichki valyuta, kredit, \"gems\", \"coins\" va shunga o'xshash resurslarni sotib olish (top-up) imkonini beradi.",
            "Yosh chegarasi: Xizmatdan foydalanish uchun minimal yosh — 14 yosh. 14 yoshdan 18 yoshgacha bo'lgan shaxslar Xizmatdan faqat ota-ona yoki qonuniy vasiysining roziligi va nazorati ostida foydalanishlari lozim.",
        ],
    },
    {
        title: "2. Atamalar",
        list: [
            { term: "Buyurtma", def: "Foydalanuvchi tomonidan tanlangan o'yin, summasi va o'yin hisob ID raqami ko'rsatilgan holda amalga oshirilgan top-up so'rovi." },
            { term: "Top-up", def: "Tanlangan o'yin hisobiga tegishli resurslarni qo'shish xizmati." },
            { term: "To'lov provayderi", def: "Payme, Click va boshqa litsenziyalangan to'lov tizimlari." },
            { term: "Akkaunt", def: "Foydalanuvchining Telegram bot/mini-app yoki mobil ilovadagi shaxsiy hisobi." },
        ],
    },
    {
        title: "3. Xizmat predmeti",
        items: [
            "Ijrochi Foydalanuvchi tomonidan bildirilgan buyurtma asosida, to'lov amalga oshirilgach, tanlangan o'yin hisobiga kelishilgan miqdorda resurs (valyuta, kredit va h.k.) yuklab beradi.",
            "Xizmat faqat vositachi sifatida ishlaydi va uchinchi tomon o'yin ishlab chiquvchilari/platformalari bilan shartnomaviy aloqada emas, agar boshqacha kelishilmagan bo'lsa.",
        ],
    },
    {
        title: "4. Akkaunt, to'g'ri ma'lumot berish va aloqa",
        items: [
            "Foydalanuvchi ro'yxatdan o'tishda yoki buyurtma berishda to'g'ri, dolzarb va o'ziga tegishli ma'lumot taqdim etishi shart.",
            "Foydalanuvchi o'z akkauntining xavfsizligini ta'minlash uchun to'liq javobgar hisoblanadi. Akkaunt orqali amalga oshirilgan barcha harakatlar Foydalanuvchi tomonidan bajarilgan deb hisoblanadi.",
            "Foydalanuvchi bilan aloqa @VallerGame_bot, push-bildirishnomalar, telefon raqami yoki email orqali amalga oshiriladi.",
            "Tranzaksiya va xavfsizlikka oid bildirishnomalar xizmatning muhim qismi bo'lib, ulardan voz kechish mumkin emas.",
        ],
    },
    {
        title: "5. Buyurtma berish va to'lov tartibi",
        items: [
            "Buyurtma berish uchun Foydalanuvchi @VallerGame_bot orqali kerakli o'yinni tanlaydi, hisob ID raqamini kiritadi, top-up summasini tanlaydi va to'lovni tasdiqlaydi.",
            "Foydalanuvchi kiritilgan o'yin hisobi ID raqami va boshqa ma'lumotlarning to'g'riligi uchun to'liq javobgar hisoblanadi.",
            "To'lov provayderlari orqali amalga oshiriladi. To'lov muvaffaqiyatli amalga oshirilgandan so'ng buyurtma bajarishga qabul qilinadi.",
            "Buyurtmani bajarish muddati texnik sabablarga ko'ra o'zgarishi mumkin.",
        ],
    },
    {
        title: "6. Narxlar va to'lov",
        items: [
            "Xizmat narxlari @VallerGame_bot ichida ko'rsatilgan holatda amal qiladi va oldindan ogohlantirmasdan o'zgartirilishi mumkin.",
            "Foydalanuvchi to'lov jarayonida to'lov provayderi tomonidan olinadigan qo'shimcha komissiya haqi bo'lishi mumkinligini tan oladi.",
        ],
    },
    {
        title: "7. Qaytarish va bekor qilish siyosati",
        items: [
            "Top-up xizmati ko'rsatilgandan so'ng buyurtma bekor qilinmaydi va pul qaytarilmaydi, chunki xizmat raqamli mahsulot hisoblanadi va darhol iste'mol qilinadi.",
            "Agar to'lov amalga oshirilgan, lekin texnik sabablarga ko'ra resurs yuklanmagan bo'lsa, Foydalanuvchi qo'llab-quvvatlash xizmatiga murojaat qilishi va pulni qaytarish yoki qayta yuklashni so'rashi mumkin.",
            "Foydalanuvchi xatosi sababli noto'g'ri ketgan buyurtmalar qaytarilmaydi: noto'g'ri hisob ID, noto'g'ri o'yin yoki paket tanlangan bo'lsa.",
            "Ijrochi tomonidagi texnik nosozlik natijasida yuzaga kelgan xatolar ko'rib chiqiladi va pul qaytariladi yoki buyurtma qayta bajariladi.",
        ],
    },
    {
        title: "8. Tomonlarning huquq va majburiyatlari",
        subsections: [
            {
                subtitle: "8.1. Foydalanuvchi huquqlari:",
                list: ["Sifatli va o'z vaqtida xizmat olish", "Qo'llab-quvvatlash xizmatidan yordam so'rash", "Maxfiylik siyosatiga muvofiq shaxsiy ma'lumotlarini himoya qilinishini talab qilish"],
            },
            {
                subtitle: "8.2. Foydalanuvchi majburiyatlari:",
                list: ["Buyurtma berishda to'g'ri va aniq ma'lumot kiritish", "Xizmatdan noqonuniy maqsadlarda foydalanmaslik", "O'yin platformasining o'z qoidalariga rioya qilish"],
            },
            {
                subtitle: "8.3. Ijrochi huquqlari:",
                list: ["Shubhali buyurtmalarni bajarishdan bosh tortish", "Narxlar va xizmat shartlarini o'zgartirish", "Qoidabuzarlik aniqlansa, xizmat ko'rsatishni to'xtatish"],
            },
        ],
    },
    {
        title: "9. Texnik xato (bag) va tizimdan noqonuniy foydalanish",
        items: [
            "Agar Foydalanuvchi texnik xato tufayli haqiqiy to'lovga mos kelmagan miqdorda resurs olsa, u bundan 24 soat ichida qo'llab-quvvatlash xizmatiga xabar berishi shart.",
            "Aniqlangan xatodan foydalanish, uni yashirish yoki takroriy tarzda o'z manfaati uchun ishlatish tizimga ruxsatsiz kirish va firibgarlik urinishi sifatida baholanadi.",
            "Bunday holat aniqlanganda Ijrochi hisobni bloklash, resurslarni bekor qilish, moddiy zararni undirish va huquqni muhofaza qilish organlariga murojaat qilish huquqiga ega.",
        ],
    },
    {
        title: "10. Pul yuvishga qarshi choralar",
        items: [
            "Xizmat pul yuvish, terrorizmni moliyalashtirish va boshqa noqonuniy moliyaviy operatsiyalarga qarshi nol darajadagi tolerantlik siyosatini olib boradi.",
            "Foydalanuvchi faqat o'ziga tegishli to'lov vositasidan foydalanishi shart. Boshqa shaxslarning kartasidan foydalanish qat'iyan taqiqlanadi.",
            "Shubhali operatsiyalar aniqlanganda Ijrochi operatsiyani to'xtatib turish, hujjat talab qilish yoki hisobni bloklash huquqiga ega.",
        ],
    },
    {
        title: "11. Javobgarlikni cheklash",
        items: [
            "Ijrochi o'yin ishlab chiquvchisi tomonidan kiritilgan o'zgarishlar, o'yin serverlaridagi uzilishlar yoki o'yin hisobining bloklanishi uchun javobgar emas.",
            "Ijrochi Telegram platformasi yoki to'lov provayderlari tomonidagi texnik nosozliklar uchun javobgar emas.",
            "Ijrochining umumiy javobgarligi Foydalanuvchi tomonidan to'langan buyurtma summasidan oshmaydi.",
        ],
    },
    {
        title: "12. Nizolarni hal qilish",
        items: [
            "Tomonlar o'rtasidagi nizolar muzokaralar yo'li bilan hal qilinadi.",
            "Kelishuvga erishilmagan taqdirda, nizolar O'zbekiston Respublikasining amaldagi qonunchiligiga muvofiq sud tartibida hal qilinadi.",
        ],
    },
    {
        title: "13. Yakuniy qoidalar",
        items: [
            "Ijrochi ushbu Shartlarni bir tomonlama tartibda o'zgartirish huquqiga ega. O'zgarishlar @VallerGame_bot orqali e'lon qilingan paytdan boshlab kuchga kiradi.",
            "Xizmatdan foydalanishni davom ettirish o'zgartirilgan Shartlarga rozilik bildirish hisoblanadi.",
            "Ushbu Shartlarning har qanday bandi haqiqiy emas deb topilsa, bu qolgan bandlarning kuchini yo'qotmaydi.",
        ],
    },
];

export default function TermsOfService() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4">
            <Head title="Foydalanish shartlari — VallerGame" />

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
                        <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-900/30">
                            <FileText className="size-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                                Foydalanish Shartlari
                            </h1>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Ommaviy oferta / Xizmat ko'rsatish shartnomasi
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

                            {section.items && (
                                <div className="space-y-3">
                                    {section.items.map((item, j) => (
                                        <div key={j} className="flex gap-3">
                                            <span className="mt-1.5 size-1.5 rounded-full bg-blue-500 shrink-0" />
                                            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                                {item}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {section.list && (
                                <div className="space-y-3">
                                    {section.list.map((def, j) => (
                                        <div key={j} className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3">
                                            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                                                {def.term}
                                            </span>
                                            <span className="text-sm text-slate-500 dark:text-slate-400">
                                                {" — "}
                                                {def.def}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {section.subsections && (
                                <div className="space-y-4">
                                    {section.subsections.map((sub, j) => (
                                        <div key={j}>
                                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                                {sub.subtitle}
                                            </p>
                                            <div className="space-y-1.5 pl-3">
                                                {sub.list.map((li, k) => (
                                                    <div key={k} className="flex gap-2">
                                                        <span className="mt-2 size-1.5 rounded-full bg-slate-400 shrink-0" />
                                                        <p className="text-sm text-slate-600 dark:text-slate-300">
                                                            {li}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Contact */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800/30 p-6 mt-4">
                    <h2 className="text-base font-bold text-slate-900 dark:text-white mb-3">
                        14. Aloqa ma'lumotlari
                    </h2>
                    <div className="space-y-1.5 text-sm text-slate-600 dark:text-slate-300">
                        <p>Telegram: <span className="font-medium text-blue-600 dark:text-blue-400">@VallerGame_bot</span></p>
                    </div>
                </div>

                {/* Footer link */}
                <div className="text-center mt-6 text-sm text-slate-400 dark:text-slate-500">
                    <Link href="/privacy" className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                        Maxfiylik siyosati →
                    </Link>
                </div>
            </div>
        </div>
    );
}
