import { usePage } from "@inertiajs/react";
import { nav } from 'framer-motion/client'
import { useState } from "react";
import VallerLogo from "@images/vg.png";

const Header = () => {
    // const [balance, setBalance] = useState(0);
    // const { user, isAuth } = useAuth();
    const { user } = usePage().props;

    return (
        <nav className='w-full  transition-colors duration-300 dark:bg-slate-800 dark:border-slate-700 dark:text-white bg-white border-slate-200'>
            <div
            className="w-full flex items-center justify-between md:px-8 px-6 py-3 container mx-auto"
        >
            <div className="flex md:gap-4 gap-2 items-center">
                <img
                    src={VallerLogo}
                    alt="Profile"
                    className="w-12 h-12 object-contain"
                />
                {/* <h1 className="md:text-lg text-sm font-bold">
                    {user?.username.length > 18
							? user?.username.slice(0, 18) + '…'
							: user?.username}
                </h1> */}
            </div>
            <div className="w-max md:px-4 px-2 md:py-2 py-1 border-2 border-blue-500 rounded-full">
                <p className="md:text-base text-xs text-blue-500 ">
                    <b>{Number(Math.floor(user?.balance))
                            .toLocaleString("fr-FR", {
                                maximumFractionDigits: 4,
                            })
                            .replace(/\s/g, " ")}</b> so'm
                </p>
            </div>
        </div>
        </nav>
    );
};

export default Header;
