import UcIcon from "@images/ucMain.webp";
import { Head, usePage } from "@inertiajs/react";
import axios from "axios";
import {
    ArrowLeft,
    CheckCircle,
    Gamepad2,
    ImageIcon,
    Loader2,
    Lock,
    XIcon,
    Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    accent,
    formatUzs,
    GAME_COLORS,
    GameVariants,
} from "../../Components/user/GameVariants";

/* ─── Shared ID verification block for UC / Bundle tabs ──────────── */
function IdVerifyBlock({ pubgId, setPubgId, pubgName, verified, verifying, error, onVerify, accentClass }) {
    return (
        <div className="mb-5 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 space-y-3">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">O'yinchi ID</label>
            <div className="flex gap-2">
                <input
                    type="text"
                    value={pubgId}
                    onChange={(e) => setPubgId(e.target.value)}
                    placeholder="PUBG ID kiriting"
                    className={`flex-1 min-w-0 h-10 rounded-xl border px-3 text-sm outline-none transition
                        ${verified ? "border-emerald-400 dark:border-emerald-600 bg-emerald-50/50 dark:bg-emerald-900/10"
                        : error    ? "border-red-400 dark:border-red-600 bg-red-50/50 dark:bg-red-900/10"
                        : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50"}
                        text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500`}
                />
                <button
                    onClick={onVerify}
                    disabled={verifying || !pubgId.trim()}
                    className={`shrink-0 h-10 px-4 rounded-xl font-semibold text-sm text-white flex items-center gap-1.5 disabled:opacity-50 bg-linear-to-r ${accentClass}`}
                >
                    {verifying ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
                    Tekshirish
                </button>
            </div>
            {verified && pubgName && (
                <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl px-3 py-2">
                    <CheckCircle size={15} className="shrink-0" />
                    <span className="font-semibold">{pubgName}</span>
                </div>
            )}
            {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
    );
}

/* ─── Purchase modal (shared for UC & Bundle tabs) ─────────────── */
function PurchaseModal({ item, itemType, user, userBalance, lastPubgAccount, onClose }) {
    const { t } = useTranslation();
    const [pubgPlayerId, setPubgPlayerId] = useState(lastPubgAccount?.pubg_player_id ?? "");
    const [pubgName, setPubgName]         = useState(lastPubgAccount?.pubg_name ?? "");
    const [verifyStatus, setVerifyStatus] = useState(null);
    const [verifyMessage, setVerifyMessage] = useState("");
    const [isVerifying, setIsVerifying]   = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const price = Number(item?.sell_price ?? 0);

    const handleVerify = async () => {
        if (!pubgPlayerId.trim()) return;
        setIsVerifying(true); setVerifyStatus(null); setVerifyMessage(""); setPubgName("");
        try {
            const res = await axios.post("/game/verify/pubg", { id: pubgPlayerId.trim() });
            const name = res?.data?.username ?? null;
            if (name) { setPubgName(name); setVerifyStatus("success"); setVerifyMessage(name); }
            else       { setVerifyStatus("error"); setVerifyMessage(t("shop.verify_not_found")); }
        } catch { setVerifyStatus("error"); setVerifyMessage(t("shop.verify_error")); }
        finally  { setIsVerifying(false); }
    };

    const handlePurchase = async () => {
        if (!item || isSubmitting || !pubgPlayerId.trim()) return;
        setIsSubmitting(true);
        try {
            const payload = {
                telegram_id: user?.id,
                payment_method: userBalance >= price ? "balance" : "click",
                pubg_player_id: pubgPlayerId.trim(),
                pubg_name: pubgName.trim(),
                order_type: itemType,
                ...(itemType === "uc"     ? { product_id: item.id } : {}),
                ...(itemType === "bundle" ? { bundle_id:  item.id } : {}),
            };
            const res = await axios.post("/payment/create", payload);
            if (res?.data?.paid_with === "balance") { onClose(); window.location.reload(); return; }
            const url = res?.data?.payment_url;
            if (url) { onClose(); window.location.href = url; return; }
            alert(t("shop.no_payment_url"));
        } catch (e) {
            alert(e?.response?.data?.message || t("shop.order_error"));
        } finally { setIsSubmitting(false); }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 px-4 pb-4 sm:pb-0"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900 flex flex-col gap-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <h2 className="text-base font-semibold text-slate-900 dark:text-white">Buyurtma</h2>
                    <button onClick={onClose} className="size-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
                        <XIcon size={15} />
                    </button>
                </div>

                {/* Product info */}
                <div className="rounded-xl bg-slate-50 dark:bg-slate-800 px-4 py-3 flex items-center gap-3">
                    {itemType === "uc" ? (
                        <>
                            <img src={UcIcon} alt="UC" className="size-9 rounded-lg" />
                            <div>
                                <p className="font-semibold text-slate-900 dark:text-white text-sm">{item.uc_amount} UC</p>
                                {item.bonus && <p className="text-xs text-emerald-600">+{item.bonus} bonus</p>}
                            </div>
                        </>
                    ) : (
                        <>
                            {item.image_url
                                ? <img src={item.image_url} alt={item.title} className="size-9 rounded-lg object-cover" />
                                : <div className="size-9 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center"><ImageIcon className="size-4 text-slate-400" /></div>
                            }
                            <p className="font-semibold text-slate-900 dark:text-white text-sm">{item.title}</p>
                        </>
                    )}
                    <p className="ml-auto font-bold text-violet-600 dark:text-violet-400 text-sm">{formatUzs(price)}</p>
                </div>

                {/* PUBG ID */}
                <div className="flex flex-col gap-2">
                    <label className="text-xs text-slate-500 dark:text-slate-400">PUBG ID</label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={pubgPlayerId}
                            onChange={(e) => { setPubgPlayerId(e.target.value); setVerifyStatus(null); setPubgName(""); }}
                            placeholder="O'yinchi ID kiriting"
                            className={`flex-1 min-w-0 h-10 rounded-lg border px-3 text-sm outline-none transition
                                ${verifyStatus === "success" ? "border-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/10 dark:border-emerald-600"
                                : verifyStatus === "error"   ? "border-red-400 bg-red-50/50 dark:bg-red-900/10 dark:border-red-600"
                                : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"}
                                text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500`}
                        />
                        <button onClick={handleVerify} disabled={isVerifying || !pubgPlayerId.trim()}
                            className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-600 dark:text-slate-300 flex items-center gap-1.5 disabled:opacity-50">
                            {isVerifying ? <Loader2 size={13} className="animate-spin" /> : <Zap size={13} />}
                            Tekshirish
                        </button>
                    </div>
                    {verifyStatus === "success" && (
                        <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
                            <CheckCircle size={12} /><span>Topildi: <strong>{verifyMessage}</strong></span>
                        </div>
                    )}
                    {verifyStatus === "error" && <p className="text-xs text-red-500">{verifyMessage}</p>}

                    {pubgName && (
                        <div>
                            <label className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500 mb-1">
                                Nickname <Lock size={10} className="ml-auto" /> <span>Auto</span>
                            </label>
                            <input readOnly value={pubgName} className="h-9 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-700/50 px-3 text-sm text-slate-500 dark:text-slate-400 cursor-not-allowed" />
                        </div>
                    )}
                </div>

                {/* Balance */}
                <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400">Balans</span>
                    <span className="font-medium text-slate-900 dark:text-white">{formatUzs(userBalance)}</span>
                </div>
                {userBalance < price && (
                    <p className="text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-2">
                        Balans yetarli emas. Click orqali to'lanadi.
                    </p>
                )}

                <button onClick={handlePurchase} disabled={isSubmitting || !pubgPlayerId.trim()}
                    className="h-12 w-full rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-semibold flex items-center justify-center gap-2 transition">
                    {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : null}
                    {isSubmitting ? "Yuklanmoqda..." : "Sotib olish"}
                </button>
            </div>
        </div>
    );
}

/* ─── Asosiy komponent ────────────────────────────────────────── */
export default function SekaliShop() {
    const { categories, user, ucProducts = [], bundles = [], lastPubgAccount } = usePage().props;
    const userBalance = Number(user?.balance ?? 0);

    const [selectedGame, setSelectedGame] = useState(() => {
        if (typeof window === "undefined") return null;
        const params = new URLSearchParams(window.location.search);
        const category = params.get("category");
        const game = params.get("game");
        return category && game ? { name: game, category } : null;
    });

    const [gameTab, setGameTab]   = useState("sekali");
    const [modalItem, setModalItem] = useState(null);
    const [modalType, setModalType] = useState(null);

    // Shared PUBG ID state — persists across tab switches
    const [sharedPubgId,   setSharedPubgId]   = useState(lastPubgAccount?.pubg_player_id ?? "");
    const [sharedPubgName, setSharedPubgName] = useState(lastPubgAccount?.pubg_name ?? "");
    const [idVerified,     setIdVerified]     = useState(false);
    const [idVerifying,    setIdVerifying]    = useState(false);
    const [idError,        setIdError]        = useState("");

    const handleIdVerify = async () => {
        if (!sharedPubgId.trim()) return;
        setIdVerifying(true); setIdError(""); setSharedPubgName(""); setIdVerified(false);
        try {
            const res = await axios.post("/game/verify/pubg", { id: sharedPubgId.trim() });
            const name = res?.data?.username ?? null;
            if (name) { setSharedPubgName(name); setIdVerified(true); }
            else { setIdError("Akkaunt topilmadi"); }
        } catch { setIdError("Tekshirishda xatolik"); }
        finally  { setIdVerifying(false); }
    };

    const catEntries = categories ? Object.entries(categories) : [];
    const hasGames = catEntries.some(([, games]) => (games ?? []).length > 0);

    const allGamesFlat = catEntries.flatMap(([cat, games]) =>
        (games ?? []).map((g) => ({ ...g, _cat: cat }))
    );
    const top3Keys = new Set(
        [...allGamesFlat]
            .sort((a, b) => (b.view_count ?? 0) - (a.view_count ?? 0))
            .slice(0, 3)
            .filter((g) => (g.view_count ?? 0) > 0)
            .map((g) => `${g._cat}||${g.name}`)
    );

    const catAcc = accent(selectedGame?.category ?? "");

    // When a new game is selected, reset to sekali tab
    useEffect(() => {
        setGameTab("sekali");
    }, [selectedGame?.name]);

    useEffect(() => {
        if (typeof window !== "undefined" && window.location.search.includes("category=")) {
            window.history.replaceState({}, "", window.location.pathname);
        }
    }, []);

    // Whether the selected game is PUBG (has manual UC products + bundles)
    const isPubg = selectedGame && /pubg/i.test(selectedGame.name);

    const tabs = isPubg
        ? [
            { key: "sekali", label: "24/7" },
            { key: "uc",     label: "Admin orqali" },
            { key: "bundle", label: "To'plamlar" },
          ]
        : null;

    return (
        <div className="w-full">
            <Head title="Do'kon" />
            <div className="container mx-auto px-3 pb-28">

                {/* ── Sticky header ── */}
                <div className="sticky top-0 z-20 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md -mx-3 px-3 pt-3 pb-2">
                    {selectedGame ? (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setSelectedGame(null)}
                                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0"
                            >
                                <ArrowLeft className="size-5 text-slate-600 dark:text-slate-300" />
                            </button>

                            {/* 3 tabs for PUBG, plain title for other games */}
                            {tabs ? (
                                <div className="flex flex-1 gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
                                    {tabs.map(({ key, label }) => (
                                        <button
                                            key={key}
                                            onClick={() => setGameTab(key)}
                                            className={`flex-1 py-2 px-1 rounded-lg text-xs font-semibold transition-all ${
                                                gameTab === key
                                                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                                                    : "text-slate-500 dark:text-slate-400"
                                            }`}
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <span className="font-semibold text-slate-900 dark:text-white truncate">
                                    {selectedGame.name}
                                </span>
                            )}
                        </div>
                    ) : (
                        <div className="py-2">
                            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Do'kon</h1>
                            <p className="text-xs text-slate-400">O'yin va raqamli mahsulotlar</p>
                        </div>
                    )}
                </div>

                {/* ── Game grid ── */}
                {!selectedGame && (
                    <div className="mt-4 space-y-8">
                        {catEntries.map(([cat, games]) => {
                            if (!games || games.length === 0) return null;
                            return (
                                <div key={cat}>
                                    <h2 className="text-base font-bold text-slate-900 dark:text-white mb-3">{cat}</h2>
                                    <div className="grid grid-cols-2 sm:grid-cols-8 gap-3">
                                        {games.map((game, i) => {
                                            const grad = GAME_COLORS[i % GAME_COLORS.length];
                                            const img = game.image_url;
                                            const isTop = top3Keys.has(`${cat}||${game.name}`);
                                            return (
                                                <button
                                                    key={`${cat}-${game.name}`}
                                                    onClick={() => setSelectedGame({ name: game.name, category: cat, image: game.image_url })}
                                                    className="relative flex flex-col items-center gap-2 p-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all text-center"
                                                >
                                                    {isTop && (
                                                        <span className="absolute top-1.5 right-1.5 z-10 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-linear-to-r from-orange-500 to-red-500 text-white leading-none shadow-sm">
                                                            TOP
                                                        </span>
                                                    )}
                                                    <div className={`relative size-16 rounded-2xl overflow-hidden flex items-center justify-center shrink-0 bg-linear-to-br ${grad}`}>
                                                        {img && (
                                                            <img src={img} alt={game.name} className="absolute inset-0 w-full h-full object-cover"
                                                                onError={(e) => { e.currentTarget.style.display = "none"; }} />
                                                        )}
                                                    </div>
                                                    <p className="font-semibold text-slate-800 dark:text-white text-sm leading-tight">{game.name}</p>
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

                {/* ── Game detail ── */}
                {selectedGame && (
                    <div className="mt-3">
                        {/* Tab 1: 24/7 SekalıPay */}
                        {gameTab === "sekali" && (
                            <GameVariants
                                category={selectedGame.category}
                                game={selectedGame.name}
                                gameImage={selectedGame.image}
                                accentColors={catAcc}
                                userBalance={userBalance}
                            />
                        )}

                        {/* Tab 2: Qo'lda tushirish (only PUBG) */}
                        {gameTab === "uc" && (
                            <div>
                                {/* Shared ID verification */}
                                <IdVerifyBlock
                                    pubgId={sharedPubgId} setPubgId={(v) => { setSharedPubgId(v); setIdVerified(false); setSharedPubgName(""); setIdError(""); }}
                                    pubgName={sharedPubgName} verified={idVerified} verifying={idVerifying} error={idError}
                                    onVerify={handleIdVerify} accentClass="from-blue-500 to-indigo-600"
                                />

                                {/* Game hero */}
                                {selectedGame.image && (
                                    <div className="relative rounded-2xl overflow-hidden mb-5 h-28">
                                        <img src={selectedGame.image} alt={selectedGame.name} className="absolute inset-0 w-full h-full object-cover opacity-30" />
                                        <div className="relative h-full flex items-center gap-4 px-5">
                                            <div className="size-16 rounded-2xl overflow-hidden shrink-0 ring-2 ring-white/30">
                                                <img src={selectedGame.image} alt={selectedGame.name} className="w-full h-full object-cover" />
                                            </div>
                                            <div>
                                                <h2 className="text-white font-bold text-lg">{selectedGame.name}</h2>
                                                <p className="text-white/70 text-xs">Qo'lda tushirish · Admin orqali</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-3">Paket tanlang</p>
                                {ucProducts.length === 0 ? (
                                    <p className="text-center py-12 text-slate-400">Mahsulotlar mavjud emas</p>
                                ) : (
                                    <div className="grid grid-cols-2 gap-3">
                                        {ucProducts.map((p) => (
                                            <button
                                                key={p.id}
                                                onClick={() => { setModalItem(p); setModalType("uc"); }}
                                                className="relative p-3 rounded-2xl border-2 border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-blue-300 dark:hover:border-blue-600 text-left transition-all"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="size-11 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0 overflow-hidden">
                                                        <img src={UcIcon} alt="UC" className="w-full h-full object-cover" />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="font-semibold text-sm text-slate-800 dark:text-white leading-tight truncate">
                                                            {p.uc_amount} UC{p.bonus ? ` +${p.bonus}` : ""}
                                                        </p>
                                                        <p className="text-xs font-bold text-blue-600 dark:text-blue-400 mt-0.5">
                                                            {formatUzs(p.sell_price)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Tab 3: To'plamlar (only PUBG) */}
                        {gameTab === "bundle" && (
                            <div>
                                {/* Shared ID verification */}
                                <IdVerifyBlock
                                    pubgId={sharedPubgId} setPubgId={(v) => { setSharedPubgId(v); setIdVerified(false); setSharedPubgName(""); setIdError(""); }}
                                    pubgName={sharedPubgName} verified={idVerified} verifying={idVerifying} error={idError}
                                    onVerify={handleIdVerify} accentClass="from-indigo-500 to-violet-600"
                                />

                                {selectedGame.image && (
                                    <div className="relative rounded-2xl overflow-hidden mb-5 h-28">
                                        <img src={selectedGame.image} alt={selectedGame.name} className="absolute inset-0 w-full h-full object-cover opacity-30" />
                                        <div className="relative h-full flex items-center gap-4 px-5">
                                            <div className="size-16 rounded-2xl overflow-hidden shrink-0 ring-2 ring-white/30">
                                                <img src={selectedGame.image} alt={selectedGame.name} className="w-full h-full object-cover" />
                                            </div>
                                            <div>
                                                <h2 className="text-white font-bold text-lg">{selectedGame.name}</h2>
                                                <p className="text-white/70 text-xs">To'plamlar</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-3">To'plam tanlang</p>
                                {bundles.length === 0 ? (
                                    <div className="text-center py-12 text-slate-400">
                                        <span className="text-4xl block mb-3">🎁</span>
                                        <p>Hozircha to'plamlar mavjud emas</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 gap-3">
                                        {bundles.map((b) => (
                                            <button
                                                key={b.id}
                                                onClick={() => { setModalItem(b); setModalType("bundle"); }}
                                                className="relative rounded-2xl border-2 border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-indigo-300 dark:hover:border-indigo-600 text-left overflow-hidden transition-all group"
                                            >
                                                <div className="h-1 w-full bg-linear-to-r from-blue-500 to-indigo-600" />
                                                <div className="h-28 bg-slate-100 dark:bg-slate-700 overflow-hidden">
                                                    {b.image_url
                                                        ? <img src={b.image_url} alt={b.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                                        : <div className="w-full h-full flex items-center justify-center"><ImageIcon className="size-8 text-slate-300 dark:text-slate-600" /></div>
                                                    }
                                                </div>
                                                <div className="p-3">
                                                    <p className="font-semibold text-sm text-slate-800 dark:text-white truncate">{b.title}</p>
                                                    <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mt-1">{formatUzs(b.sell_price)}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Purchase modal */}
            {modalItem && (
                <PurchaseModal
                    item={modalItem}
                    itemType={modalType}
                    user={user}
                    userBalance={userBalance}
                    lastPubgAccount={sharedPubgId ? { pubg_player_id: sharedPubgId, pubg_name: sharedPubgName } : lastPubgAccount}
                    onClose={() => { setModalItem(null); setModalType(null); }}
                />
            )}
        </div>
    );
}
