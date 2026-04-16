import { useLocation, Link } from "react-router-dom";
import {
  LayoutDashboard,
  FolderOpen,
  Users,
  BarChart3,
  Settings,
  Fish,
} from "lucide-react";

export default function Sidebar() {
  const location = useLocation();

  const navItems = [
    { path: "/", label: "Dashboard", icon: LayoutDashboard },
    { path: "/cases", label: "Cases", icon: FolderOpen },
    { path: "/contacts", label: "Contacts", icon: Users },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h1>
          <Fish size={20} style={{ marginRight: 8, verticalAlign: "middle" }} />
          Skretting<span>CRM</span>
        </h1>
        <p>Customer Relationship Manager</p>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section">
          <div className="nav-section-title">Main</div>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${
                location.pathname === item.path ||
                (item.path !== "/" && location.pathname.startsWith(item.path))
                  ? "active"
                  : ""
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          ))}
        </div>

        <div className="nav-section">
          <div className="nav-section-title">Insights</div>
          <div className="nav-item">
            <BarChart3 size={18} />
            Reports
          </div>
          <div className="nav-item">
            <Settings size={18} />
            Settings
          </div>
        </div>
      </nav>

      <div className="sidebar-footer">
        <div className="user-avatar">IS</div>
        <div className="user-info">
          <div className="user-name">Ingrid Solberg</div>
          <div className="user-role">Account Manager</div>
        </div>
      </div>
    </aside>
  );
}
