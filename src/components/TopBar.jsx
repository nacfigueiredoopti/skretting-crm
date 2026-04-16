import { Search, Bell } from "lucide-react";

export default function TopBar({ title }) {
  return (
    <div className="top-bar">
      <h2>{title}</h2>
      <div className="top-bar-actions">
        <div className="search-bar">
          <Search size={16} />
          <input type="text" placeholder="Search cases, contacts..." />
        </div>
        <button className="notification-btn">
          <Bell size={20} />
          <span className="notification-badge"></span>
        </button>
      </div>
    </div>
  );
}
