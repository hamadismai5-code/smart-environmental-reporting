import {
  LayoutDashboard,
  FileText,
  Building2,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Leaf,
} from "lucide-react";

function AdminSidebar({
  activePage,
  setActivePage,
  admin,
  onLogout,
}) {
  const menuItems = [
    {
      name: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Reports",
      icon: FileText,
    },
    {
      name: "Departments",
      icon: Building2,
    },
    {
      name: "Officers",
      icon: Users,
    },
    {
      name: "Analytics",
      icon: BarChart3,
    },
    {
      name: "Settings",
      icon: Settings,
    },
  ];

  return (
    <aside className="admin-sidebar">

      <div className="admin-brand">

        <div className="admin-brand-icon">
          <Leaf size={24} />
        </div>

        <div>
          <strong>
            SmartReport
          </strong>

          <span>
            Municipal Portal
          </span>
        </div>

      </div>

      <div className="admin-profile">

        <div className="admin-profile-avatar">
          {admin?.name
            ?.charAt(0)
            ?.toUpperCase() || "A"}
        </div>

        <div className="admin-profile-info">

          <strong>
            {admin?.name || "Administrator"}
          </strong>

          <span>
            {admin?.role === "super_admin"
              ? "Super Administrator"
              : "Administrator"}
          </span>

        </div>

      </div>

      <div className="admin-menu">

        <p className="admin-menu-title">
          MAIN MENU
        </p>

        {menuItems.map((item) => {

          const Icon = item.icon;

          return (
            <button
              key={item.name}
              type="button"
              className={`admin-menu-item ${
                activePage === item.name
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setActivePage(item.name)
              }
            >
              <Icon size={19} />

              <span>
                {item.name}
              </span>
            </button>
          );
        })}

      </div>

      <div className="admin-sidebar-bottom">

        <button
          type="button"
          className="admin-menu-item logout"
          onClick={onLogout}
        >
          <LogOut size={19} />

          <span>
            Logout
          </span>
        </button>

      </div>

    </aside>
  );
}

export default AdminSidebar;