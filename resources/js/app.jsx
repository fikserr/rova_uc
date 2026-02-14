import "../css/app.css";
import "./bootstrap";

import { createInertiaApp } from "@inertiajs/react";
import { createRoot } from "react-dom/client";
import AdminLayout from "./Pages/Layout/AdminLayout";
import UserLayout from "./Pages/Layout/UserLayout";

import axios from "axios";

/* ---------------------------------
   AXIOS GLOBAL CONFIG
---------------------------------- */

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

        if (!importPage) {
            const NotFound = await pages["./Pages/Errors/NotFound.jsx"]();
            return NotFound.default;
        }

        const page = await importPage();
        const Component = page.default;

        if (typeof Component.layout === "undefined") {
            Component.layout = (pageElement) => {
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
            };
        }

        return Component;
    },

    setup({ el, App, props }) {
        createRoot(el).render(<App {...props} />);
    },

    progress: {
        color: "#3B82F6",
    },
});
