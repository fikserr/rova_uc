import Bar from "../shared/Bar";
import Header from "../shared/header";

function UserLayout({ children }) {
    return (
        <div className="w-full relative h-max bg-[#EFF6FF]">
            {/* Topbar */}
            <header className="z-20 h-max w-full fixed top-0 left-0 bg-white shadow flex items-center px-4">
                <Header />
            </header>

            <main className="w-full h-full flex-1 p-0 my-14  bg-transparent">
                {children}
            </main>
            <Bar />
        </div>
    );
}

export default UserLayout;
