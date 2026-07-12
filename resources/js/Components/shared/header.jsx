import VallerLogo from "@images/vg.png";
import { Link, usePage } from "@inertiajs/react";
import { Bell } from "lucide-react";

const Header = () => {
    const { user } = usePage().props;

    const balance = Number(Math.floor(user?.balance ?? 0))
        .toLocaleString("fr-FR", { maximumFractionDigits: 4 })
        .replace(/\s/g, " ");

    return (
        <nav className="w-full transition-colors duration-300 bg-white border-b border-slate-200 dark:bg-[#0b0a12]/95 dark:backdrop-blur dark:border-white/5">
            <div className="w-full flex items-center justify-between px-4 py-3">
                <Link href="/user-services" className="flex items-center gap-2">
                    <img
                        src={VallerLogo}
                        alt="Valler Gaming"
                        className="w-9 h-9 object-contain"
                    />
                    <div className="leading-tight">
                        <p className="text-black dark:text-white font-extrabold text-xs tracking-wide">
                            VALLER
                        </p>
                        <p className="text-violet-500 dark:text-violet-400 font-bold text-[9px] tracking-widest -mt-0.5">
                            GAMING
                        </p>
                    </div>
                </Link>

                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-violet-50 border border-violet-200 dark:bg-violet-500/10 dark:border-violet-500/30">
                        <p className="text-xs font-bold text-violet-600 dark:text-violet-300">
                            {balance}
                        </p>
                        <span className="text-[10px] text-violet-500/70 dark:text-violet-400/70">
                            so'm
                        </span>
                    </div>

                    <Link
                        href="/user-notifications"
                        className="size-8 rounded-full flex items-center justify-center bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-slate-300 border border-transparent dark:border-white/10"
                    >
                        <Bell className="size-4" />
                    </Link>
                </div>
            </div>
        </nav>
    );
};

export default Header;
