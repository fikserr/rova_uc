import { useState } from "react";
import { Sidebar } from "../Sidebar";
import React from "react";
import TelegramAuthBootstrap from "../TelegramAuthBootstrap";
export default function AdminLayout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <>
            <div className="flex min-h-screen bg-gray-100">
                {/* Sidebar */}
                <Sidebar
                    isOpen={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                />

                {/* Main content */}
                <div className="flex-1 flex flex-col">
                    {/* Topbar */}
                    <header className="h-14 bg-white shadow flex items-center px-4">
                        <button
                            className="md:hidden mr-3 text-xl"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                        >
                            ☰
                        </button>
                        <h1 className="font-semibold">Admin Panel</h1>
                    </header>

                    {/* Page content */}
                    <main className="flex-1 p-6">{children}</main>
                </div>
            </div>
        </>

    );
}
