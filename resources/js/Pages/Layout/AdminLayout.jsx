import { toggleTheme } from "@/Hook/theme";
import { LanguageProvider, useLanguage } from "@/Hook/useLanguage";
import { LANGUAGES } from "@/lang/translations";
import { router } from "@inertiajs/react";
import { LogOut, Moon, Sun } from "lucide-react";
import { useState } from "react";
import { Sidebar } from "../../Components/Sidebar";

function LangToggle() {
    const { lang, setLang } = useLanguage();
    const [open, setOpen] = useState(false);
    const current = LANGUAGES.find(l => l.code === lang) ?? LANGUAGES[0];

    return (
        <div className="relative">
            <button
                onClick={() => setOpen(o => !o)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors select-none"
            >
                <span>{current.flag}</span>
                <span>{current.label}</span>
                <svg className={`size-3 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {open && (
                <>
                    {/* backdrop */}
                    <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
                    <div className="absolute right-0 top-full mt-1.5 z-50 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg overflow-hidden min-w-25">
                        {LANGUAGES.map(l => (
                            <button
                                key={l.code}
                                onClick={() => { setLang(l.code); setOpen(false); }}
                                className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-medium transition-colors text-left ${l.code === lang
                                    ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                                }`}
                            >
                                <p className='text-sm lg:text-lg'>{l.flag}</p>
                                <p className='text-sm lg:text-lg'>{l.label}</p>
                                {l.code === lang && <span className="ml-auto size-1.5 rounded-full bg-blue-500" />}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

function AdminLayoutInner({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-gray-100 dark:bg-slate-950 dark:text-gray-200 overflow-x-hidden">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="flex-1 flex flex-col dark:text-white min-w-0 w-0 md:ml-64">
                <header className="h-14 bg-white shadow flex items-center justify-between px-4 dark:bg-slate-900 sticky top-0 z-50">
                    <div className="flex items-center">
                        <button className="mr-3 text-xl" onClick={() => setSidebarOpen(!sidebarOpen)}>
                            ☰
                        </button>
                        <h1 className="font-semibold">Admin Panel</h1>
                    </div>

                    <div className="flex items-center gap-2">
                        <LangToggle />

                        <button
                            onClick={toggleTheme}
                            className="rounded-full flex items-center justify-center w-10 h-10 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 cursor-pointer"
                        >
                            <Moon className="dark:hidden" />
                            <Sun className="hidden dark:block" />
                        </button>

                        <button
                            onClick={() => router.post('/logout')}
                            className="rounded-full flex items-center justify-center w-10 h-10 bg-gray-200 dark:bg-gray-600 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 cursor-pointer transition-colors"
                            title="Chiqish"
                        >
                            <LogOut className="size-4" />
                        </button>
                    </div>
                </header>

                <main className="flex-1 p-3 sm:p-5 dark:text-white overflow-x-hidden">
                    {children}
                </main>
            </div>
        </div>
    );
}

export default function AdminLayout({ children }) {
    return (
        <LanguageProvider>
            <AdminLayoutInner>{children}</AdminLayoutInner>
        </LanguageProvider>
    );
}
