import UcIcon from "@images/ucMain.webp";
import { ArrowRight, Coins, Crown, Star , ShoppingCart } from "lucide-react";
import { IoDiamondOutline } from "react-icons/io5";
/* ---------------------------------------------
   Title generator (single source of truth)
--------------------------------------------- */

function generateCardTitle(product) {
    const { type, service_type, value } = product;

    switch (type) {
        case "uc":
            return `${value} UC`;

        case "diamond":
            return `${value} Diamonds`;

        case "tg":
            if (service_type === "stars") {
                return `${value} Stars`;
            }

            if (service_type === "premium") {
                if (value % 12 === 0) {
                    return `${value / 12} Year Premium`;
                } else {
                    return `${value} Month Premium`;
                }
            }
            break;

        default:
            return "Unknown Product";
    }
}

/* ---------------------------------------------
   Icon resolver
--------------------------------------------- */

function getProductIcon(product) {
    if (product.type === "uc") return UcIcon;
    if (product.type === "diamond") return IoDiamondOutline;
    if (product.type === "tg" && product.service_type === "stars") return Star;
    if (product.type === "tg" && product.service_type === "premium")
        return Crown;
    return Coins;
}

/* ---------------------------------------------
   Product Card Component
--------------------------------------------- */

export default function UserProductCard({ product, onClick }) {
    const Icon = getProductIcon(product);
    const title = generateCardTitle(product);

    return (
        <button
            onClick={onClick}
            className="group relative w-full rounded-2xl md:rounded-3xl bg-white p-4 sm:p-6 text-left shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:bg-slate-800 dark:border dark:border-slate-700"
        >
            {/* Header */}
            <div className="flex items-center gap-4 mb-y md:mb-5">
                <div
                    className={`flex items-center justify-center size-12 rounded-2xl  text-blue-600 ${typeof Icon === "string" ? "bg-transparent" : "bg-blue-100"} `}
                >
                    {typeof Icon === "string" ? (
                        <img
                            src={Icon}
                            alt={title}
                            className="w-9 md:w-12 h-9 md:h-12 object-contain"
                        />
                    ) : (
                        <Icon className="size-6" />
                    )}
                </div>

                <div >
                    <h3 className="text-base md:text-xl font-bold text-slate-900 font font-mono dark:text-white">
                        {title}
                    </h3>
                    <p className="hidden md:block md:text-xs text-slate-500 dark:text-slate-400">
                        {product.type === "uc"
                            ? "Pubg Mobile"
                            : product.type === "diamond"
                              ? "Mobile Legends Bang Bang"
                              : product.type === "tg" && "Telegram messenger"}
                    </p>
                </div>
            </div>

            {/* Price */}
            <div className="flex items-end justify-between w-full mt-2">
                <div className='w-full'>
                    <div className="text-sm md:text-2xl font-extrabold text-blue-600 dark:text-gray-300 font-mono w-full mb-2 md:mb-0 ">
                        {Number(Math.floor(product.sell_price))
                            .toLocaleString("fr-FR", {
                                maximumFractionDigits: 4,
                            })
                            .replace(/\s/g, ",")}{' '}
                        {product.sell_currency === "USD" ? " $" : product.sell_currency }
                    </div>
                    <div className="bg-blue-500 md:bg-transparent w-max p-1 md:p-0 font-mono font-semibold rounded-sm text-xs md:text-xl text-white md:text-gray-500 dark:text-slate-400 flex items-center justify-between gap-2">
                        Sotib olish <ShoppingCart className='block md:hidden size-3'/>
                    </div>
                </div>

                <div className="hidden md:flex items-center justify-center size-10 rounded-full bg-blue-500 text-white opacity-0 transition group-hover:opacity-100">
                    <ArrowRight className="size-5" />
                </div>
            </div>
        </button>
    );
}
