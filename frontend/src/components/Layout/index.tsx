import { Link, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";

import Sidebar from "../Sidebar";
import SessionExpiredModal from "../SessionExpiredModal";

import { useAppSelector, useAppDispatch } from "../../store/hooks";
import { logout } from "../../features/auth/authSlice";
import { sessionExpiredEvent } from "../../api/apiSlice";

const Layout = () => {
  const [showSessionExpiredModal, setShowSessionExpiredModal] = useState(false);
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(
    (state) => state?.auth?.isAuthenticated
  );

  useEffect(() => {
    const handleSessionExpired = () => {
      // Logout the user
      dispatch(logout());
      // Show the modal
      setShowSessionExpiredModal(true);
    };

    // Listen for session expiration events
    sessionExpiredEvent.addEventListener('sessionExpired', handleSessionExpired);

    return () => {
      sessionExpiredEvent.removeEventListener('sessionExpired', handleSessionExpired);
    };
  }, [dispatch]);

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

        <SessionExpiredModal 
          isOpen={showSessionExpiredModal}
          onClose={() => setShowSessionExpiredModal(false)}
        />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-950 text-white">
      <main className="p-6 flex-1 overflow-y-auto">
        <Outlet />
      </main>
      
      <SessionExpiredModal 
        isOpen={showSessionExpiredModal}
        onClose={() => setShowSessionExpiredModal(false)}
      />
    </div>
  );
};

export default Layout;
