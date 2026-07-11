import { useEffect, useMemo, useRef, useState } from "react";
import { router } from "@inertiajs/react";

const STORAGE_KEY = "__tg_auth";
// Tracks the initData of the last auth attempt to detect failure loops
const ATTEMPT_KEY = "__tg_auth_attempt";

function getTelegramInitData() {
    if (typeof window === "undefined") return "";
    const tg = window.Telegram?.WebApp;
    let initData = tg?.initData?.trim?.() ?? "";
    if (!initData && window.location.hash) {
        const match = window.location.hash.match(/tgWebAppData=([^&]+)/);
        if (match) initData = decodeURIComponent(match[1]);
    }
    return initData?.trim?.() ?? "";
}

// Extract telegram_id from initData string for comparison
function getTelegramIdFromInitData(initData) {
    try {
        const params = new URLSearchParams(initData);
        const userStr = params.get("user");
        if (!userStr) return null;
        const userObj = JSON.parse(decodeURIComponent(userStr));
        return userObj?.id ?? null;
    } catch (_) {
        return null;
    }
}

function submitAuthForm(initData) {
    try {
        sessionStorage.setItem(STORAGE_KEY, initData);
        // Track this attempt so we can detect failure on next load
        sessionStorage.setItem(ATTEMPT_KEY, initData);
    } catch (_) {}
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
    const [status, setStatus] = useState("idle");
    const [errorMessage, setErrorMessage] = useState("");

    // Signal WebApp ready exactly once — calling multiple times confuses Android Telegram
    useEffect(() => {
        try { window.Telegram?.WebApp?.ready?.(); } catch (_) {}
    }, []);

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
            // Auth succeeded — clear any failure tracking
            try { sessionStorage.removeItem(ATTEMPT_KEY); } catch (_) {}

            const initData = getTelegramInitData();

            if (initData) {
                const currentTgId = getTelegramIdFromInitData(initData);
                const storedTgId = getTelegramIdFromInitData(
                    (() => { try { return sessionStorage.getItem(STORAGE_KEY) ?? ""; } catch (_) { return ""; } })()
                );
                // user.id IS the Telegram ID (users table uses telegram_id as PK)
                const loggedInTgId = user?.id != null ? String(user.id) : null;
                const curIdStr = currentTgId != null ? String(currentTgId) : null;

                const accountMismatch = curIdStr && (
                    // Case 1: sessionStorage has a different account stored
                    (storedTgId && curIdStr !== String(storedTgId)) ||
                    // Case 2: fresh WebView (sessionStorage empty) but logged-in user ≠ initData user
                    // This is the Android account-switch bug: WebView reopens fresh, old session
                    // cookie still active, but Telegram injected a different user's initData.
                    (!storedTgId && loggedInTgId && curIdStr !== loggedInTgId)
                );

                if (accountMismatch) {
                    submitAuthForm(initData);
                    return;
                }

                // Same user — update stored initData (auth_date rotates each session)
                try { sessionStorage.setItem(STORAGE_KEY, initData); } catch (_) {}
            }

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

            // Detect failure loop: if we already attempted this initData and
            // still ended up here with no user, auth failed.
            let lastAttempt = null;
            try { lastAttempt = sessionStorage.getItem(ATTEMPT_KEY); } catch (_) {}

            if (lastAttempt === initData) {
                try { sessionStorage.removeItem(ATTEMPT_KEY); } catch (_) {}

                // Distinguish failure reason from URL param set by the backend redirect
                const urlParams = new URLSearchParams(window.location.search);
                const reason = urlParams.get("reason");

                if (reason === "phone_required" || reason === "no_account") {
                    fail(
                        "Telegram bot orqali ro'yxatdan o'tishingiz kerak. Botni oching, /start bosing va telefon raqamingizni ulashing.",
                        "E_NOT_REGISTERED"
                    );
                } else if (reason === "auth_failed") {
                    fail(
                        "Autentifikatsiya xatosi yuz berdi. Iltimos qayta urinib ko'ring yoki botga /start bosing.",
                        "E_AUTH_FAILED"
                    );
                } else {
                    fail(
                        "Kirish tasdiqlanmadi. Qayta urinib ko'ring.",
                        "E_UNKNOWN"
                    );
                }
                return;
            }

            tried.current = true;
            setStatus("authenticating");
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
                            <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full border-2 border-red-500/40 bg-red-500/10 text-2xl">
                                ✕
                            </div>
                            <h1 className="text-xl font-semibold text-red-400">
                                Kirish tasdiqlanmadi
                            </h1>
                            <p className="mt-3 text-sm text-slate-300">
                                {errorMessage || "Auth failed (E_UNKNOWN_UI)."}
                            </p>
                            <button
                                className="mt-5 w-full rounded-xl bg-white/10 py-2.5 text-sm font-medium text-white hover:bg-white/20 transition"
                                onClick={() => {
                                    try { sessionStorage.removeItem(ATTEMPT_KEY); } catch (_) {}
                                    window.location.reload();
                                }}
                            >
                                Qayta urinish
                            </button>
                        </>
                    )}
                </div>
            </div>
        );
    }

    return children;
}
