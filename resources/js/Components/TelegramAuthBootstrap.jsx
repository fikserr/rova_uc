import { useEffect, useMemo, useRef, useState } from "react";
import { router } from "@inertiajs/react";

const STORAGE_KEY = "__tg_auth";

function getTelegramInitData() {
    if (typeof window === "undefined") return "";
    const tg = window.Telegram?.WebApp;
    try { tg?.ready?.(); } catch (_) {}
    let initData = tg?.initData?.trim?.() ?? "";
    if (!initData && window.location.hash) {
        const match = window.location.hash.match(/tgWebAppData=([^&]+)/);
        if (match) initData = decodeURIComponent(match[1]);
    }
    return initData?.trim?.() ?? "";
}

function submitAuthForm(initData) {
    try { sessionStorage.setItem(STORAGE_KEY, initData); } catch (_) {}
    const old = document.getElementById("__tg_form");
    if (old) old.remove();
    const form = document.createElement("form");
    form.id = "__tg_form";
    form.method = "POST";
    form.action = "/telegram/webapp/session";
    form.style.display = "none";
    const inp = document.createElement("input");
    inp.type = "hidden";
    inp.name = "init_data";
    inp.value = initData;
    form.appendChild(inp);
    document.body.appendChild(form);
    form.submit();
}

export default function TelegramAuthBootstrap({
    children,
    isAuthPage = false,
    user = null,
}) {
    const tried = useRef(false);
    const registrationRetryCount = useRef(0);
    const [status, setStatus] = useState("idle");
    const [errorMessage, setErrorMessage] = useState("");

    const isTelegramWebView = useMemo(() => {
        if (typeof window === "undefined") return false;
        const hasInitData = getTelegramInitData().length > 0;
        const search = window.location.search;
        const hash = window.location.hash;
        const hasTelegramParams =
            search.includes("tgWebApp") ||
            hash.includes("tgWebApp") ||
            search.includes("tgWebAppPlatform") ||
            hash.includes("tgWebAppPlatform") ||
            search.includes("tgWebAppData=") ||
            hash.includes("tgWebAppData=");
        const platform = window.Telegram?.WebApp?.platform;
        const hasKnownTelegramPlatform =
            typeof platform === "string" &&
            platform.trim() !== "" &&
            platform !== "unknown";
        return Boolean(hasTelegramParams || hasKnownTelegramPlatform || hasInitData);
    }, []);

    useEffect(() => {
        if (status === "failed") return;

        if (user) {
            // User bor — lekin Telegram session bilan mos keladimi?
            // sessionStorage da saqlangan initData bilan solishtiramiz
            const initData = getTelegramInitData();

            if (initData) {
                let stored = null;
                try { stored = sessionStorage.getItem(STORAGE_KEY); } catch (_) {}

                if (stored !== initData) {
                    // Boshqa akkount initData si — form POST orqali qayta autentifikatsiya
                    // fetch() emas: Android WebView da Set-Cookie navigatsiyaga ta'sir qilmaydi
                    submitAuthForm(initData);
                    return;
                }
            }

            // initData mos — to'g'ri user
            setStatus("authenticated");
            if (isAuthPage) {
                router.replace("/");
            }
            return;
        }

        if (!isTelegramWebView || tried.current) {
            if (!isTelegramWebView) {
                setStatus("skipped");
            }
            return;
        }

        let cancelled = false;

        const authenticate = async () => {
            const fail = (message, code = "E_UNKNOWN") => {
                setErrorMessage(message || `Auth failed (${code})`);
                setStatus("failed");
            };

            setStatus("checking");

            const startedAt = Date.now();
            let initData = getTelegramInitData();

            while (!initData && Date.now() - startedAt < 10000) {
                await new Promise((resolve) => window.setTimeout(resolve, 100));
                if (cancelled) return;
                initData = getTelegramInitData();
            }

            if (!initData) {
                fail("Telegram initData topilmadi. (E_INITDATA_EMPTY)");
                return;
            }

            tried.current = true;
            setStatus("authenticating");

            // initData mavjud, user yo'q → form POST (Android va boshqa barcha platformalar uchun)
            submitAuthForm(initData);
        };

        authenticate();

        return () => {
            cancelled = true;
        };
    }, [isAuthPage, isTelegramWebView, status, user]);

    const shouldHandleTelegramAuthScreen =
        isAuthPage && isTelegramWebView && !user;

    const isFailureState = status === "failed";

    if (shouldHandleTelegramAuthScreen) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950 px-6 text-white">
                <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-white/5 p-8 text-center shadow-2xl backdrop-blur">
                    {!isFailureState ? (
                        <>
                            <div className="mx-auto mb-5 h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-cyan-400" />
                            <h1 className="text-xl font-semibold">
                                {status === "authenticated"
                                    ? "Kirish tasdiqlandi"
                                    : "Telegram orqali kirilmoqda"}
                            </h1>
                            <p className="mt-3 text-sm text-slate-300">
                                {status === "authenticated"
                                    ? "Sahifaga yo'naltirilmoqda..."
                                    : "Sessiya tekshirilmoqda. Agar tasdiqlansa, sahifa avtomatik davom etadi."}
                            </p>
                        </>
                    ) : (
                        <>
                            <h1 className="text-xl font-semibold">Kirish tasdiqlanmadi</h1>
                            <p className="mt-3 text-sm text-slate-300">
                                {errorMessage || "Auth failed (E_UNKNOWN_UI)."}
                            </p>
                        </>
                    )}
                </div>
            </div>
        );
    }

    return children;
}
