import { Link } from "@inertiajs/react";
import { Gamepad2, Package, Plus, Zap } from "lucide-react";

const TABS = [
    {
        page: "uc",
        name: "UC Products",
        href: "/products-uc",
        icon: Gamepad2,
        active: "bg-blue-600 text-white shadow-md shadow-blue-200 dark:shadow-blue-900/30",
        inactive:
            "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-white",
        addBtn: "bg-blue-600 hover:bg-blue-700 shadow-blue-200 dark:shadow-blue-900/30",
    },
    {
        page: "bundles",
        name: "To'plamlar",
        href: "/products-bundles",
        icon: Package,
        active: "bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-indigo-900/30",
        inactive:
            "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-white",
        addBtn: "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200 dark:shadow-indigo-900/30",
    },
    {
        page: "services",
        name: "Services",
        href: "/products-services",
        icon: Zap,
        active: "bg-amber-500 text-white shadow-md shadow-amber-200 dark:shadow-amber-900/30",
        inactive:
            "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-white",
        addBtn: "bg-amber-500 hover:bg-amber-600 shadow-amber-200 dark:shadow-amber-900/30",
    },
];

function TopBar({ pageFor, setEditing, setFormOpen, reset }) {
    const current = TABS.find((t) => t.page === pageFor) ?? TABS[0];
    const Icon = current.icon;

    return (
        <div className="w-full space-y-5">
            {/* Title row */}
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white leading-tight">
                        Products Management
                    </h2>
                    <p className="text-slate-400 dark:text-slate-500 mt-1 text-sm">
                        Manage game currency and Telegram services
                    </p>
                </div>

                {/* Add button */}
                <button
                    className={`flex items-center gap-2 px-4 h-10 rounded-xl text-white text-sm font-bold transition-all active:scale-95 shadow-sm shrink-0 ${current.addBtn}`}
                    onClick={() => {
                        setEditing(null);
                        setFormOpen(true);
                        reset();
                    }}
                >
                    <Plus className="size-4" />
                    <span className="hidden sm:inline">Add Product</span>
                    <span className="sm:hidden">Add</span>
                </button>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2">
                {TABS.map((tab) => {
                    const TabIcon = tab.icon;
                    const isActive = tab.page === pageFor;
                    return (
                        <Link
                            key={tab.page}
                            href={tab.href}
                            className={`flex items-center gap-2 px-4 h-9 rounded-xl text-sm font-semibold transition-all ${
                                isActive ? tab.active : tab.inactive
                            }`}
                        >
                            <TabIcon className="size-3.5 shrink-0" />
                            <span className="hidden sm:inline">{tab.name}</span>
                            <span className="sm:hidden">
                                {tab.page === "uc"
                                    ? "UC"
                                    : tab.page === "diamonds"
                                      ? "ML"
                                      : "SRV"}
                            </span>
                        </Link>
                    );
                })}
            </div>

            {/* Page subtitle bar */}
            <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/60 shadow-sm">
                <div
                    className={`size-8 rounded-xl flex items-center justify-center text-white shrink-0
                    ${
                        pageFor === "uc"
                            ? "bg-linear-to-br from-blue-500 to-indigo-600"
                            : pageFor === "bundles"
                              ? "bg-linear-to-br from-indigo-500 to-violet-600"
                              : "bg-linear-to-br from-amber-400 to-orange-500"
                    }`}
                >
                    <Icon className="size-4" />
                </div>
                <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-white leading-tight capitalize">
                        {pageFor === "uc" ? "UC Products" : pageFor === "bundles" ? "To'plamlar" : "Service Products"}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                        Active product listings
                    </p>
                </div>
            </div>
        </div>
    );
}

export default TopBar;
