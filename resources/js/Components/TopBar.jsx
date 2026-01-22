function TopBar({ pageFor, setEditing, setFormOpen, reset }) {
    const sevices = [
        { page: "uc", name: "UC Products", bgColor: "bg-[#155DFC] text-white" },
        { page: "diamonds", name: "Diamond Products", bgColor: "bg-purple-600 text-white" },
        { page: "services", name: "Telegram Services", bgColor: "bg-yellow-500 text-white" },
    ];

    return (
        <div className="w-full space-y-6">
            {/* Title */}
            <div>
                <h2 className="text-xl md:text-3xl font-bold text-gray-900">
                    Products Management
                </h2>
                <p className="text-gray-500 mt-1 text-sm md:text-base">
                    Manage game currency and Telegram services
                </p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 md:gap-4">
                <a
                    href="/products-uc"
                    className={`px-3 md:px-5 py-2 md:py-3 rounded-lg text-sm md:text-base font-medium transition-all ${
                        pageFor === "uc"
                            ? "bg-[#155DFC] text-white"
                            : "bg-white hover:bg-blue-700 hover:text-white"
                    }`}
                >
                    UC
                </a>

                <a
                    href="/products-ml"
                    className={`px-3 md:px-5 py-2 md:py-3 rounded-lg text-sm md:text-base font-medium transition-all ${
                        pageFor === "diamonds"
                            ? "bg-purple-600 text-white"
                            : "bg-white hover:bg-purple-600 hover:text-white"
                    }`}
                >
                    Diamond
                </a>

                <a
                    href="/products-services"
                    className={`px-3 md:px-5 py-2 md:py-3 rounded-lg text-sm md:text-base font-medium transition-all ${
                        pageFor === "services"
                            ? "bg-yellow-500 text-white"
                            : "bg-white hover:bg-yellow-600 hover:text-white"
                    }`}
                >
                    Services
                </a>
            </div>

            {/* Page title + action */}
            <div className="flex items-center justify-between gap-2">
                <h1 className="text-lg md:text-2xl font-bold capitalize truncate">
                    🎮 {pageFor} Products
                </h1>

                <button
                    className={`px-3 md:px-4 py-2 text-sm md:text-base rounded-lg cursor-pointer ${
                        sevices.find(s => s.page === pageFor)?.bgColor
                    }`}
                    onClick={() => {
                        setEditing(null);
                        setFormOpen(true);
                        reset();
                    }}
                >
                    + Add
                </button>
            </div>
        </div>
    );
}

export default TopBar;
