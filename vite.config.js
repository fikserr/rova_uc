import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from "@vitejs/plugin-react";
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.jsx'],
            refresh: true,
        }),
        react(),
        tailwindcss(),
    ],
    server: {
        host: "127.0.0.1", // ✅ tashqi tarmoqdan ham kirish uchun
        port: process.env.PORT || 5173, // Railway o'z portini o‘zi beradi
    },
});
