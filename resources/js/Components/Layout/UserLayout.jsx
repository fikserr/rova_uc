import Bar from "../shared/Bar";
import Header from "../shared/header";

function UserLayout({ children }) {
    return (
        <div className="w-full relative h-max min-h-screen flex flex-col bg-gray-100 dark:bg-slate-800">
            {/* Topbar */}
            <header className="z-20 h-max w-full fixed top-0 left-0 bg-white shadow flex items-center p-0">
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
