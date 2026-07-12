import Bar from "../../Components/shared/Bar";
import Header from "../../Components/shared/header";
// import UserRightPanel from "../../Components/user/UserRightPanel";
import UserSidebar from "../../Components/user/UserSidebar";
import UserTopBar from "../../Components/user/UserTopBar";

function UserLayout({ children }) {
    return (
        <div className="w-full h-screen bg-gray-100 dark:bg-[#0b0a12]">
            {/* -- Mobile (< lg): existing top header + bottom tab bar, page scrolls normally -- */}
            <div className="lg:hidden w-full h-full overflow-y-visible">
                <header className="z-20 h-max w-full fixed top-0 left-0 bg-white shadow flex items-center p-0">
                    <Header />
                </header>
                <main className="w-full flex-1 p-0 my-14 bg-transparent">
                    {children}
                </main>
                <Bar />
            </div>

            {/* -- Desktop (>= lg): fixed app shell. Sidebar/topbar/right-panel never move;
                 only the center content column scrolls. -- */}
            <div className="hidden lg:flex h-screen w-full overflow-hidden">
                <UserSidebar />

                <div className="flex-1 flex flex-col h-screen lg:ml-64  min-w-0">
                    {/* <UserTopBar /> */}
                    <Header />
                    <main className="w-full overflow-y-scroll px-6 py-6 min-h-screen">
                        {children}
                    </main>
                </div>

                {/* <UserRightPanel /> */}
            </div>
        </div>
    );
}

export default UserLayout;
