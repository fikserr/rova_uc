import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import laravel from "laravel-vite-plugin";
import { defineConfig } from "vite";
import path from "path";
export default defineConfig({
    plugins: [
        laravel({
            input: ["resources/css/app.css", "resources/js/app.jsx"],
            refresh: true,
        }),
        react(),
        tailwindcss(),
    ],
    server: {
        host: "127.0.0.1", // ✅ tashqi tarmoqdan ham kirish uchun
        port: process.env.PORT || 5173, // Railway o'z portini o‘zi beradi
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "resources/js"),
            "@images": path.resolve(__dirname, "public/storage/assets"),
            "@shared": path.resolve(
                __dirname,
                "resources/js/components/shared",
            ),
            "@ui": path.resolve(__dirname, "resources/js/components/ui"),
        },
    },
});
