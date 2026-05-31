import "../css/app.css";
import "./bootstrap";
import "./i18n/index.js"; // ← ADD THIS LINE
import { initTheme } from "./Hook/theme";
initTheme();

import { createInertiaApp } from "@inertiajs/react";
import { createRoot } from "react-dom/client";
import TelegramAuthBootstrap from "./Components/TelegramAuthBootstrap";
import AdminLayout from "./Pages/Layout/AdminLayout";
import UserLayout from "./Pages/Layout/UserLayout";

import axios from "axios";

import { route } from "ziggy-js";
import { Ziggy } from "./ziggy";

if (typeof window !== "undefined") {
    Ziggy.url = window.location.origin;
}

window.route = route;
window.Ziggy = Ziggy;

axios.defaults.withCredentials = true;
axios.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
axios.defaults.baseURL = window.location.origin;

/* ---------------------------------
   INERTIA APP
---------------------------------- */

createInertiaApp({
    resolve: async (name) => {
        const pages = import.meta.glob("./Pages/**/*.jsx");
        const importPage = pages[`./Pages/${name}.jsx`];

        const page = await importPage();
        const Component = page.default;
        const isAuthPage = name.startsWith("Auth/");

        const WrappedPage = (props) => (
            <TelegramAuthBootstrap
                isAuthPage={isAuthPage}
                user={props?.auth?.user}
            >
                <Component {...props} />
            </TelegramAuthBootstrap>
        );

        WrappedPage.layout =
            Component.layout ??
            ((pageElement) => {
                if (isAuthPage) {
                    return pageElement;
                }

                if (pageElement?.props?.auth?.user) {
                    const isAdmin =
                        pageElement?.props?.auth?.user?.role === "admin";
                    return isAdmin ? (
                        <AdminLayout>{pageElement}</AdminLayout>
                    ) : (
                        <UserLayout>{pageElement}</UserLayout>
                    );
                } else {
                    return pageElement;
                }
            });

        return WrappedPage;
    },

    setup({ el, App, props }) {
        createRoot(el).render(<App {...props} />);
    },

    progress: {
        color: "#3B82F6",
    },
});
