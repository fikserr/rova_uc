import { toggleTheme } from "@/Hook/theme";
import { Moon, Sun } from "lucide-react";
import { useState } from "react";
import { Sidebar } from "../../Components/Sidebar";
export default function AdminLayout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <>
            <div className="flex min-h-screen bg-gray-100 dark:bg-slate-950 dark:text-gray-200">
                {/* Sidebar */}
                <Sidebar
                    isOpen={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                />

                {/* Main content */}
                <div className="flex-1 flex flex-col dark:text-white">
                    {/* Topbar */}
                    <header className="h-14 bg-white shadow flex items-center justify-between px-4 dark:bg-slate-900 sticky w-full top-0 l-0 z-50">
                        <div className="flex items-center ">
                            <button
                                className="mr-3 text-xl"
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                            >
                                ☰
                            </button>
                            <h1 className="font-semibold">Admin Panel</h1>
                        </div>

                        <button
                            onClick={toggleTheme}
                            className="rounded-full flex items-center justify-center w-10 h-10 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 cursor-pointer"
                        >
                            <Moon className="dark:hidden" />
                            <Sun className="hidden dark:block" />
                        </button>
                    </header>

                    {/* Page content */}
                    <main className="flex-1 p-6 dark:text-white ">
                        {children}
                    </main>
                </div>
            </div>
        </>
    );
}
