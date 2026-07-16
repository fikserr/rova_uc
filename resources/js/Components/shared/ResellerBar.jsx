import { Link, usePage } from "@inertiajs/react";
import {
    HandCoins,
    LayoutDashboard,
    LogOut,
    ShoppingBag,
    User,
    Wallet,
} from "lucide-react";
import { useTranslation } from "react-i18next";

function isNavActive(url, href) {
    const [urlPath, urlQuery] = url.split("?");
    const [hrefPath, hrefQuery] = href.split("?");

    if (hrefPath !== "/reseller") {
        return urlPath === hrefPath || urlPath.startsWith(hrefPath + "/");
    }
    // Both "Dashboard" and "Narxlarim" point at /reseller — split by ?tab=prices
    const isPricesTab = urlQuery?.includes("tab=prices");
    return hrefQuery ? isPricesTab : urlPath === "/reseller" && !isPricesTab;
}

export default function ResellerBar() {
    const { url } = usePage();
    const { t } = useTranslation();
    const csrfToken = document.querySelector(
        'meta[name="csrf-token"]',
    )?.content;

    const NAV = [
        { href: "/reseller", icon: LayoutDashboard, label: t("bar.dashboard") },
        { href: "/reseller/shop", icon: ShoppingBag, label: t("bar.shop") },
        { href: "/reseller/balance", icon: Wallet, label: t("bar.balance") },
        { href: "/reseller/profile", icon: User, label: t("bar.profile") },
    ];

    return (
        <>
            {/* ─── DESKTOP SIDEBAR ─── */}
            <aside className="hidden lg:flex fixed left-0 top-0 h-full w-60 flex-col bg-[#0f0f1a] border-r border-white/5 z-100">
                <div className="px-5 pt-7 pb-4">
                    <div className="flex items-center gap-2.5">
                        <div className="size-8 rounded-xl bg-violet-600 flex items-center justify-center">
                            <HandCoins className="size-4 text-white" />
                        </div>
                        <span className="font-black text-white tracking-wide text-lg">
                            Valler Reseller
                        </span>
                    </div>
                </div>

                <nav className="flex-1 px-3 space-y-0.5 mt-2">
                    {NAV.map((n) => {
                        const Icon = n.icon;
                        const active = isNavActive(url, n.href);
                        return (
                            <Link
                                key={n.label}
                                href={n.href}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                                    active
                                        ? "bg-violet-600/15 text-violet-300 border border-violet-500/20"
                                        : "text-slate-500 hover:text-slate-300 hover:bg-white/3"
                                }`}
                            >
                                <Icon className="size-4 shrink-0" />
                                {n.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="px-3 pb-6">
                    <form method="POST" action="/logout">
                        <input type="hidden" name="_token" value={csrfToken} />
                        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:text-rose-400 hover:bg-rose-500/5 transition-all">
                            <LogOut className="size-4" />
                            Chiqish
                        </button>
                    </form>
                </div>
            </aside>

            {/* ─── MOBILE BOTTOM NAV ─── */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0f0f1a]/95 backdrop-blur-xl border-t border-white/6 px-2 py-2 flex items-center justify-around">
                {NAV.map((n) => {
                    const Icon = n.icon;
                    const active = isNavActive(url, n.href);
                    return (
                        <Link
                            key={n.label}
                            href={n.href}
                            className={`flex-1 flex flex-col items-center gap-1 py-1 rounded-xl transition-all ${
                                active
                                    ? "text-violet-400"
                                    : "text-slate-600 hover:text-slate-400"
                            }`}
                        >
                            <Icon className="size-5" />
                            <span className="text-[10px] font-bold">
                                {n.label}
                            </span>
                        </Link>
                    );
                })}
            </nav>
        </>
    );
}
