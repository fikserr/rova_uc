import { useEffect, useRef } from "react";
import { router } from "@inertiajs/react";

export default function useTelegramAuth(authUser) {
    const tried = useRef(false);

    useEffect(() => {
        if (tried.current) return;
        if (authUser) return; // User allaqachon auth bo'lsa hech narsa qilmaymiz

        const tg = typeof window !== "undefined" ? window.Telegram?.WebApp : null;
        let initData = tg?.initData?.trim?.();

        // Agar hash orqali kelgan bo'lsa
        if (!initData && typeof window !== "undefined" && window.location.hash) {
            const m = window.location.hash.match(/tgWebAppData=(.+)$/);
            if (m) initData = decodeURIComponent(m[1]);
        }

        if (!initData?.trim?.()) {
            console.log("⚠️ No Telegram initData found");
            return;
        }

        initData = initData.trim();
        tried.current = true;

        const csrfToken = document.cookie
            ?.split("; ")
            ?.find((row) => row.startsWith("XSRF-TOKEN="))
            ?.split("=")[1];

        const headers = {
            "Content-Type": "application/json",
            Accept: "application/json",
            "X-Requested-With": "XMLHttpRequest",
        };
        if (csrfToken) headers["X-XSRF-TOKEN"] = decodeURIComponent(csrfToken);

        console.log("📤 Sending Telegram initData to backend...");

        fetch("/telegram/webapp/session", {
            method: "POST",
            headers,
            credentials: "include",
            body: JSON.stringify({ init_data: initData }),
        })
            .then(async (res) => {
                if (res.ok) {
                    console.log("✅ Auth successful, reloading...");
                    router.reload();
                } else {
                    const data = await res.json();
                    console.warn("❌ Auth failed", data);
                }
            })
            .catch((err) => {
                console.error("❌ Telegram auth error:", err);
            });
    }, [authUser]);
}
