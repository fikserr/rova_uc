import { usePage } from "@inertiajs/react";
import { nav } from 'framer-motion/client'
import { useState } from "react";

const Header = () => {
    const [balance, setBalance] = useState(0);
    // const { user, isAuth } = useAuth();
    const { user } = usePage().props;

    return (
        <nav className='w-full  transition-colors duration-300 dark:bg-slate-800 dark:border-slate-700 dark:text-white bg-white border-slate-200'>
            <div
            className="w-full flex items-center justify-between px-8 py-3 container mx-auto"
        >
            <div className="flex gap-4 items-center">
                <img
                    src={"https://www.freeiconspng.com/uploads/pubg-circle-battlegrounds-photo-23.png"}
                    alt="Profile"
                    className="w-10 h-10"
                />
                <h1 className="text-lg font-bold">{user?.username}</h1>
            </div>
            <div className="w-max px-4 py-2 border-2 border-blue-500 rounded-full">
                <p className="text-base text-blue-500 ">
                    <b>{balance}</b> UZS
                </p>
            </div>
        </div>
        </nav>
    );
};

export default Header;
