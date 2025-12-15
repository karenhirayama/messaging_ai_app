import { Link, Outlet } from "react-router-dom";

import Sidebar from "../Sidebar";

import { useAppSelector } from "../../store/hooks";

const Layout = () => {
  const isAuthenticated = useAppSelector(
    (state) => state?.auth?.isAuthenticated
  );

  if (isAuthenticated) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />

        <div className="flex-1 flex flex-col">
          <header className="p-4 bg-slate-950 text-white shadow-md flex items-center">
            <Link to="/" className="text-xl">
              Lari and friends
            </Link>
          </header>

          <main className="p-6 flex-1 bg-slate-950 text-white overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-950 text-white">
      <main className="p-6 flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
