import { useState } from "react";

const Header = () => {
    const [balance, setBalance] = useState(0);
    const user = { name: "Foydalanuvchi" };

    return (
        <div className="w-full flex items-center justify-between px-5 py-3">
            <div className="flex gap-4 items-center">
                <img
                    src="https://www.freeiconspng.com/uploads/pubg-circle-battlegrounds-photo-23.png"
                    alt="Profile"
                    className="w-10 h-10"
                />
                <h1 className="text-lg font-bold">{user.name}</h1>
            </div>
            <div className="w-max px-4 py-2 border-2 border-[#00A63E] rounded-full">
                <p className="text-base text-[#00A63E] ">
                    <b>{balance}</b> UZS
                </p>
            </div>
        </div>
    );
};

export default Header;
