import { Link, usePage } from "@inertiajs/react";
import { Palette, Settings, TrendingUp } from "lucide-react";

function SpinTopBar() {
    const { url } = usePage();

    // ✅ FIXED LOGIC
    const isActive = (page) => url.startsWith(page);

    return (
        <div>
            <div className="mb-6 md:mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                    Spin System Management
                </h2>
                <p className="w-full text-gray-500 mt-1">
                    Configure spin rules, sectors, and view spin history
                </p>
            </div>

            {/* Tabs Navigation */}
            <div className="flex border-b border-gray-200 mb-6">
                <Link
                    href="/spin-rules"
                    className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-colors text-[12px] md:text-base ${
                        isActive("/spin-rules")
                            ? "border-blue-600 text-blue-600"
                            : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                >
                    <Settings className="w-5 h-5" />
                    Spin Rules
                </Link>

                <Link
                    href="/spin-sectors"
                    className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-colors text-[12px] md:text-base ${
                        isActive("/spin-sectors")
                            ? "border-blue-600 text-blue-600"
                            : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                >
                    <Palette className="w-5 h-5" />
                    Spin Sectors
                </Link>

                <Link
                    href="/spin-history"
                    className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-colors text-[12px] md:text-base ${
                        isActive("/spin-history")
                            ? "border-blue-600 text-blue-600"
                            : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                >
                    <TrendingUp className="w-5 h-5" />
                    Spin History
                </Link>
            </div>
        </div>
    );
}

export default SpinTopBar;
