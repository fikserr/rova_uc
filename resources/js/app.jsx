import '../css/app.css';
import './bootstrap';
import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import { Ziggy } from "./ziggy";
import { route } from "ziggy-js";
import { initTheme } from "@/Hook/theme"; // ✅ ADD THIS
window.route = route;
window.Ziggy = Ziggy;

initTheme();
createInertiaApp({
    resolve: (name) => {
        const pages = import.meta.glob('./Pages/**/*.jsx', { eager: true });
        return pages[`./Pages/${name}.jsx`].default;
    },

    setup({ el, App, props }) {
        createRoot(el).render(<App {...props} />);
    },
});
