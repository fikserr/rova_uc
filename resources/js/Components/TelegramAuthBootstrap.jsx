import { useEffect, useMemo, useRef, useState } from "react";
import { router } from "@inertiajs/react";

function getTelegramInitData() {
    if (typeof window === "undefined") {
        return "";
    }

    const tg = window.Telegram?.WebApp;
    try {
        tg?.ready?.();
    } catch (_) {
        // ignore
    }
    let initData = tg?.initData?.trim?.() ?? "";

    if (! initData && window.location.hash) {
        const match = window.location.hash.match(/tgWebAppData=([^&]+)/);
        if (match) {
            initData = decodeURIComponent(match[1]);
        }
    }

    return initData?.trim?.() ?? "";
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
        if (typeof window === "undefined") {
            return false;
        }

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

        return Boolean(
            hasTelegramParams ||
            hasKnownTelegramPlatform ||
            hasInitData,
        );
    }, []);

    useEffect(() => {
        if (status === "failed") {
            return;
        }

        if (user) {
            setStatus("authenticated");

            if (isAuthPage) {
                router.replace("/");
            }

            return;
        }

        if (! isTelegramWebView || tried.current) {
            if (! isTelegramWebView) {
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

            while (! initData && Date.now() - startedAt < 10000) {
                await new Promise((resolve) => window.setTimeout(resolve, 100));
                if (cancelled) {
                    return;
                }
                initData = getTelegramInitData();
            }

            if (! initData) {
                fail("Telegram initData topilmadi. (E_INITDATA_EMPTY)");
                return;
            }

            tried.current = true;
            setStatus("authenticating");

            const csrfToken = document.cookie
                ?.split("; ")
                ?.find((row) => row.startsWith("XSRF-TOKEN="))
                ?.split("=")[1];

            const headers = {
                "Content-Type": "application/json",
                Accept: "application/json",
                "X-Requested-With": "XMLHttpRequest",
                "X-Telegram-Init-Data": initData,
            };

            if (csrfToken) {
                headers["X-XSRF-TOKEN"] = decodeURIComponent(csrfToken);
            }

            try {
                const controller = new AbortController();
                const timeoutId = window.setTimeout(() => controller.abort(), 30000);
                let response;
                try {
                    response = await fetch(route("telegram.webapp.session"), {
                        method: "POST",
                        headers,
                        credentials: "include",
                        signal: controller.signal,
                        body: JSON.stringify({ init_data: initData }),
                    });
                } finally {
                    window.clearTimeout(timeoutId);
                }

                if (! response.ok) {
                    let message = `So'rov xatosi (${response.status})`;
                    let payload = null;
                    if (response.status === 419) {
                        message = "Sessiya tokeni topilmadi (419). Iltimos WebApp'ni qayta oching.";
                    }
                    try {
                        payload = await response.json();
                        if (payload?.message) {
                            message = payload.message;
                        } else if (payload?.debug_reason) {
                            message = payload.debug_reason;
                        }
                    } catch (_) {
                        // ignore json parsing errors
                    }

                    // First open can race with bot polling registration; retry briefly.
                    if (
                        response.status === 403 &&
                        payload?.message === "User is not registered via bot"
                    ) {
                        let shouldRetry = false;
                        if (registrationRetryCount.current < 3) {
                            registrationRetryCount.current += 1;
                            shouldRetry = true;
                            await new Promise((resolve) => window.setTimeout(resolve, 2000));
                        }

                        if (! cancelled && shouldRetry) {
                            tried.current = false;
                            setStatus("checking");
                            return;
                        }
                    }

                    fail(`${message} (E_HTTP_${response.status})`);
                    return;
                }

                setStatus("authenticated");
                registrationRetryCount.current = 0;

                // Full reload is more reliable here because session cookie was just created by fetch.
                window.location.replace("/");
            } catch (error) {
                console.error("Telegram auth request error", error);
                const code = error?.name === "AbortError" ? "E_FETCH_ABORT" : "E_FETCH";
                fail(`So'rov yuborishda xatolik yuz berdi. (${code})`);
            }
        };

        authenticate();

        return () => {
            cancelled = true;
        };
    }, [isAuthPage, isTelegramWebView, status, user]);

    const shouldHandleTelegramAuthScreen =
        isAuthPage &&
        isTelegramWebView &&
        ! user;

    const isFailureState = status === "failed";

    if (shouldHandleTelegramAuthScreen) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950 px-6 text-white">
                <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-white/5 p-8 text-center shadow-2xl backdrop-blur">
                    {! isFailureState ? (
                        <>
                            <div className="mx-auto mb-5 h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-cyan-400" />
                            <h1 className="text-xl font-semibold">
                                {status === "authenticated" ? "Kirish tasdiqlandi" : "Telegram orqali kirilmoqda"}
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

