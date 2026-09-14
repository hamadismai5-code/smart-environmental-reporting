import { useEffect, useState } from "react";

import AdminSidebar from "./AdminSidebar";
import AdminLogin from "./AdminLogin";

import AdminDashboard from "./AdminDashboard";
import AdminReports from "./AdminReports";
import AdminDepartments from "./AdminDepartments";
import AdminOfficers from "./AdminOfficers";
import AdminAnalytics from "./AdminAnalytics";

function AdminApp() {
  const [activePage, setActivePage] =
    useState("Dashboard");

  const [admin, setAdmin] = useState(null);

  const [checkingSession, setCheckingSession] =
    useState(true);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const response = await fetch(
        "http://localhost:8000/api/admin_session.php",
        {
          method: "GET",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (data.success && data.authenticated) {
        setAdmin(data.admin);
      } else {
        setAdmin(null);
      }

    } catch (error) {
      console.error(
        "Session check failed:",
        error
      );

      setAdmin(null);

    } finally {
      setCheckingSession(false);
    }
  };

  const handleLogin = (adminData) => {
    setAdmin(adminData);
    setActivePage("Dashboard");
  };

  const handleLogout = async () => {
    try {
      await fetch(
        "http://localhost:8000/api/admin_logout.php",
        {
          method: "POST",
          credentials: "include",
        }
      );
    } catch (error) {
      console.error(
        "Logout failed:",
        error
      );
    }

    setAdmin(null);
    setActivePage("Dashboard");
  };

  if (checkingSession) {
    return (
      <div className="admin-auth-loading">
        <div className="admin-auth-loading-card">
          <div className="admin-auth-spinner"></div>

          <h2>Checking session...</h2>

          <p>
            Please wait while we verify your
            administrator access.
          </p>
        </div>
      </div>
    );
  }

  if (!admin) {
    return (
      <AdminLogin
        onLogin={handleLogin}
      />
    );
  }

  return (
    <div className="admin-layout">

      <AdminSidebar
        activePage={activePage}
        setActivePage={setActivePage}
        admin={admin}
        onLogout={handleLogout}
      />

      <div className="admin-content">

        {activePage === "Dashboard" && (
          <AdminDashboard />
        )}

        {activePage === "Reports" && (
          <AdminReports />
        )}

        {activePage === "Departments" && (
          <AdminDepartments />
        )}

        {activePage === "Officers" && (
          <AdminOfficers />
        )}

        {activePage === "Analytics" && (
          <AdminAnalytics />
        )}

        {activePage === "Settings" && (
          <main className="admin-main">

            <div className="admin-placeholder">

              <h1>Settings</h1>

              <p>
                Settings will be connected next.
              </p>

            </div>

          </main>
        )}

      </div>

    </div>
  );
}

export default AdminApp;