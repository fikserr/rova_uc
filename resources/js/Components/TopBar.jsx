function TopBar({ pageFor , setEditing ,setFormOpen ,reset , }) {
    const sevices = [
        {
            page: "uc",
            name: "UC Products",
            link: "/uc-products",
            bgColor: "bg-[#155DFC] text-white",
            hoverBgColor: "hover:bg-blue-700 hover:text-white",
        },
        {
            page: "diamonds",
            name: "Diamond Products",
            link: "/ml-products",
            bgColor: "bg-purple-600 text-white",
            hoverBgColor: "hover:bg-purple-600 hover:text-white",
        },
        {
            page: "services",
            name: "Telegram Services",
            link: "/services",
            bgColor: "bg-yellow-500 text-white",
            hoverBgColor: "hover:bg-yellow-500 hover:text-white",
        },
    ];

    return (
        <div className="w-full space-y-8">
            <div className="mb-6 md:mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                    Products Management
                </h2>
                <p className="text-gray-500 mt-1">
                    Manage game currency and Telegram services
                </p>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 sm:gap-4 mb-10">
                <a
                    href="/uc-products"
                    className={`px-5 sm:px-5 py-3 rounded-lg font-medium transition-all cursor-pointer ${pageFor === 'uc' ? 'bg-[#155DFC] text-white' : 'bg-white hover:bg-blue-700 hover:text-white' } `}
                >
                    UC (PUBG)
                </a>
                <a
                    href="/ml-products"
                    className={`px-5 sm:px-5 py-3 rounded-lg font-medium transition-all  hover:text-white  cursor-pointer ${pageFor === 'diamonds' ?'bg-purple-600 text-white' : 'hover:bg-purple-600 hover:text-white bg-white ' } `}
                >
                    Diamond (MLBB)
                </a>
                <a
                    href="/services"
                    className={`px-5 sm:px-5 py-3 bg-white rounded-lg font-medium transition-all hover:bg-yellow-500 hover:text-white cursor-pointer ${pageFor === 'services' ?'bg-yellow-500 text-white' : 'hover:bg-yellow-600 hover:text-white bg-white ' }`}
                >
                    Telegram Services
                </a>
            </div>
            <div className="w-full flex items-center justify-between">
                <h1 className="text-2xl font-bold capitalize">🎮 {pageFor} Products</h1>
                <button
                    className={`px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer ${sevices.find(s => s.page === pageFor)?.bgColor}`}
                    onClick={() => {
                        setEditing(null); // new product
                        setFormOpen(true);
                        reset(); // reset form
                    }}
                >
                    + Add {sevices.find(s => s.page === pageFor)?.name}
                </button>
            </div>
        </div>
    );
}

export default TopBar;
