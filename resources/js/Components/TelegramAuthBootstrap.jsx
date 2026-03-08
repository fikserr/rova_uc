import { useEffect, useRef } from 'react';
import { usePage, router } from '@inertiajs/react';

/**
 * When the app is opened inside Telegram WebView with initData,
 * sends initData to backend once to establish session. No secrets on frontend.
 */
export default function TelegramAuthBootstrap() {
    const { props } = usePage();
    const tried = useRef(false);

    useEffect(() => {
        if (tried.current) return;
        const user = props?.auth?.user ?? props?.user ?? null;
        if (user) {
            console.log('✅ User already authenticated:', user);
            return;
        }

        const tg = typeof window !== 'undefined' ? window.Telegram?.WebApp : null;
        let initData = tg?.initData?.trim?.();
        if (!initData && typeof window !== 'undefined' && window.location.hash) {
            const m = window.location.hash.match(/tgWebAppData=(.+)$/);
            if (m) initData = decodeURIComponent(m[1]);
        }
        if (!initData?.trim?.()) {
            console.log('⚠️ No Telegram initData found');
            return;
        }
        initData = initData.trim();

        tried.current = true;

        const csrfToken = document.cookie
            ?.split('; ')
            ?.find((row) => row.startsWith('XSRF-TOKEN='))
            ?.split('=')[1];
        const headers = {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
        };
        if (csrfToken) {
            headers['X-XSRF-TOKEN'] = decodeURIComponent(csrfToken);
        }

        console.log('📤 Sending Telegram initData to backend...');
        fetch(route('telegram.webapp.session'), {
            method: 'POST',
            headers,
            credentials: 'include',
            body: JSON.stringify({ init_data: initData }),
        })
            .then((r) => {
                if (r.ok) {
                    console.log('✅ Auth successful, reloading...');
                    router.reload();
                } else {
                    console.error('❌ Auth failed, status', r.status);
                }
            })
            .catch((err) => {
                console.error('❌ Telegram auth request error', err);
            });
    }, [props?.auth?.user, props?.user]);

    return null;
}
