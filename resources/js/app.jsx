import '../css/app.css';
import './bootstrap';
import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import { Ziggy } from "./ziggy";
import { route } from "ziggy-js";
import TelegramAuthBootstrap from "./Components/TelegramAuthBootstrap";

// So‘rovlar har doim joriy sahifa originiga ketsin (ngrok / production)
if (typeof window !== 'undefined') {
    Ziggy.url = window.location.origin;
}
window.route = route;
window.Ziggy = Ziggy;

createInertiaApp({
    resolve: (name) => {
        const pages = import.meta.glob('./Pages/**/*.jsx', { eager: true });
        const Page = pages[`./Pages/${name}.jsx`]?.default;
        if (!Page) return Page;
        return function ResolvedPage() {
            return (
                <>
                    <TelegramAuthBootstrap />
                    <Page />
                </>
            );
        };
    },

    setup({ el, App, props }) {
        createRoot(el).render(<App {...props} />);
    },
});
