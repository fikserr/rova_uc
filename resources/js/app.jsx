import "../css/app.css";
import "./bootstrap";

import { createInertiaApp } from "@inertiajs/react";
import { createRoot } from "react-dom/client";
import AdminLayout from "./Pages/Layout/AdminLayout";
import UserLayout from "./Pages/Layout/UserLayout";
import TelegramAuthBootstrap from "./Components/TelegramAuthBootstrap";

import axios from "axios";

import { Ziggy } from "./ziggy";
import { route } from "ziggy-js";

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

        const WrappedPage = (props) => (
            <>
                <TelegramAuthBootstrap />
                <Component {...props} />
            </>
        );

        WrappedPage.layout =
            Component.layout ??
            ((pageElement) => {
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

