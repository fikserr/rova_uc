import UcIcon from "@images/ucMain.webp";
import { ArrowRight, Coins, Crown, Star } from "lucide-react";
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
            className="group relative w-full rounded-3xl bg-white p-6 text-left shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
        >
            {/* Header */}
            <div className="flex items-center gap-4 mb-5">
                <div
                    className={`flex items-center justify-center size-12 rounded-2xl  text-blue-600 ${typeof Icon === "string" ? "bg-transparent" : "bg-blue-100"} `}
                >
                    {typeof Icon === "string" ? (
                        <img
                            src={Icon}
                            alt={title}
                            className="w-12 h-12 object-contain"
                        />
                    ) : (
                        <Icon className="size-6" />
                    )}
                </div>

                <div>
                    <h3 className="text-xl font-bold text-slate-900 font font-mono">
                        {title}
                    </h3>
                    <p className="text-xs text-slate-500">
                        {product.type === "uc"
                            ? "Pubg Mobile"
                            : product.type === "diamond"
                              ? "Mobile Legends Bang Bang"
                              : product.type === "tg" && "Telegram messenger"}
                    </p>
                </div>
            </div>

            {/* Price */}
            <div className="flex items-end justify-between">
                <div>
                    <div className="text-2xl font-extrabold text-blue-600 font-mono">
                        {Number(Math.floor(product.sell_price)).toLocaleString(
                            "fr-FR",
                            {
                                maximumFractionDigits: 4, // keeps up to 4 decimals if needed
                            },
                        )}{" "}
                        {product.sell_currency}
                    </div>
                    <div className="text-xs text-slate-500">
                        Buyurtma berish
                    </div>
                </div>

                <div className="flex items-center justify-center size-10 rounded-full bg-blue-500 text-white opacity-0 transition group-hover:opacity-100">
                    <ArrowRight className="size-5" />
                </div>
            </div>
        </button>
    );
}
