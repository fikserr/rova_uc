import { useEffect } from "react";

const STORAGE_KEY = "__tg_auth";

export default function useTelegramAuth() {
    useEffect(() => {
        const getInitData = () => {
            const tg = window.Telegram?.WebApp;
            let data = tg?.initData?.trim?.() || "";
            if (!data && window.location.hash) {
                const m = window.location.hash.match(/tgWebAppData=([^&]+)/);
                if (m) data = decodeURIComponent(m[1]);
            }
            return data.trim();
        };

        const doAuth = () => {
            const initData = getInitData();
            if (!initData) return;

            // sessionStorage: loop oldini olish uchun
            // Har yangi initData (boshqa akkount) = yangi tekshiruv
            try {
                if (sessionStorage.getItem(STORAGE_KEY) === initData) return;
                sessionStorage.setItem(STORAGE_KEY, initData);
            } catch (_) {}

            // Form POST: barcha WebView larda ishlaydigan yagona ishonchli usul
            // fetch() → Set-Cookie Android da cookie jar ga tushmaydi (Chrome WebView bug)
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
        };

        // Mount bo'lganda darhol tekshiramiz
        doAuth();

        // Android da bir xil WebView qayta ishlatilganda trigger
        const onVisible = () => {
            if (document.visibilityState === "visible") doAuth();
        };
        document.addEventListener("visibilitychange", onVisible);

        const tg = window.Telegram?.WebApp;
        tg?.onEvent?.("activated", doAuth);

        return () => {
            document.removeEventListener("visibilitychange", onVisible);
            tg?.offEvent?.("activated", doAuth);
        };
    }, []);
}
