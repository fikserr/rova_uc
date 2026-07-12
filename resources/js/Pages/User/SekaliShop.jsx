import { Head, usePage } from "@inertiajs/react";
import { ArrowLeft, Gamepad2 } from "lucide-react";
import { useEffect, useState } from "react";
import {
    accent,
    GAME_COLORS,
    GameVariants,
} from "../../Components/user/GameVariants";

/* ── Asosiy komponent ────────────────────────────────────────── */
export default function SekaliShop() {
    const { categories, user } = usePage().props;
    const userBalance = Number(user?.balance ?? 0);

    // selectedGame now holds { name, category } once picked, or null when on the grouped grid.
    // If the page was opened with ?category=...&game=... (e.g. from the top-bar
    // search), jump straight into that game's variants instead of the grid.
    const [selectedGame, setSelectedGame] = useState(() => {
        if (typeof window === "undefined") return null;
        const params = new URLSearchParams(window.location.search);
        const category = params.get("category");
        const game = params.get("game");
        return category && game ? { name: game, category } : null;
    });

    // Keep categories as separate groups (with a header each) instead of
    // flattening into one list.
    const catEntries = categories ? Object.entries(categories) : [];
    const hasGames = catEntries.some(([, games]) => (games ?? []).length > 0);

    const catAcc = accent(selectedGame?.category ?? "");

    useEffect(() => {
        if (
            typeof window !== "undefined" &&
            window.location.search.includes("category=")
        ) {
            window.history.replaceState({}, "", window.location.pathname);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="w-full">
            <Head title="Do'kon" />
            <div className="container mx-auto px-3 pb-28">
                {/* Header — variantlar ekranida faqat orqaga tugmasi, banner o'zi sarlavhani ko'rsatadi */}
                <div className="flex items-center gap-3 py-4 sticky -top-8 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md z-10 -mx-3 px-3">
                    {selectedGame ? (
                        <button
                            onClick={() => setSelectedGame(null)}
                            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0"
                        >
                            <ArrowLeft className="size-5 text-slate-600 dark:text-slate-300" />
                        </button>
                    ) : (
                        <div className="min-w-0">
                            <h1 className="text-xl font-bold text-slate-900 dark:text-white truncate">
                                Do'kon
                            </h1>
                            <p className="text-xs text-slate-400 truncate">
                                O'yin va raqamli mahsulotlar
                            </p>
                        </div>
                    )}
                </div>

                {/* Har bir kategoriya — nomi bilan, o'z grid'i bilan */}
                {!selectedGame && (
                    <div className="mt-2 space-y-8">
                        {catEntries.map(([cat, games]) => {
                            if (!games || games.length === 0) return null;
                            return (
                                <div key={cat}>
                                    <h2 className="text-base font-bold text-slate-900 dark:text-white mb-3">
                                        {cat}
                                    </h2>
                                    <div className="grid grid-cols-2 sm:grid-cols-8 gap-3">
                                        {games.map((game, i) => {
                                            const grad =
                                                GAME_COLORS[
                                                    i % GAME_COLORS.length
                                                ];
                                            const img = game.image_url;
                                            return (
                                                <button
                                                    key={`${cat}-${game.name}`}
                                                    onClick={() =>
                                                        setSelectedGame({
                                                            name: game.name,
                                                            category: cat,
                                                            image: game.image_url,
                                                        })
                                                    }
                                                    className="flex flex-col items-center gap-2 p-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all text-center"
                                                >
                                                    <div
                                                        className={`relative size-16 rounded-2xl overflow-hidden flex items-center justify-center shrink-0 bg-linear-to-br ${grad}`}
                                                    >
                                                        {img && (
                                                            <img
                                                                src={img}
                                                                alt={game.name}
                                                                className="absolute inset-0 w-full h-full object-cover"
                                                                onError={(
                                                                    e,
                                                                ) => {
                                                                    e.currentTarget.style.display =
                                                                        "none";
                                                                }}
                                                            />
                                                        )}
                                                    </div>
                                                    <p className="font-semibold text-slate-800 dark:text-white text-sm leading-tight">
                                                        {game.name}
                                                    </p>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                        {!hasGames && (
                            <div className="text-center py-16 text-slate-400">
                                <Gamepad2 className="size-12 mx-auto mb-3 opacity-30" />
                                <p>Mahsulotlar yo'q. Sync qiling.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Server tabs + Variantlar */}
                {selectedGame && (
                    <div className="mt-2">
                        <GameVariants
                            category={selectedGame.category}
                            game={selectedGame.name}
                            gameImage={selectedGame.image}
                            accentColors={catAcc}
                            userBalance={userBalance}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
