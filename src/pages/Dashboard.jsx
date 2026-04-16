import { useNavigate } from "react-router-dom";
import {
  FolderOpen,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  TrendingUp,
  Package,
  Star,
} from "lucide-react";
import { dashboardStats, recentActivity, cases } from "../data/mockData";

export default function Dashboard() {
  const navigate = useNavigate();
  const priorityCases = cases.filter(
    (c) => c.priority === "Critical" || c.priority === "High"
  );

  return (
    <div className="page-content">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Open Cases</span>
            <div className="stat-icon green">
              <FolderOpen size={20} />
            </div>
          </div>
          <div className="stat-value">{dashboardStats.openCases}</div>
          <div className="stat-change positive">+2 this week</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Critical Cases</span>
            <div className="stat-icon red">
              <AlertTriangle size={20} />
            </div>
          </div>
          <div className="stat-value">{dashboardStats.criticalCases}</div>
          <div className="stat-change negative">Requires attention</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Feed Tonnage MTD</span>
            <div className="stat-icon blue">
              <Package size={20} />
            </div>
          </div>
          <div className="stat-value">{dashboardStats.feedTonnageMTD}</div>
          <div className="stat-change positive">+8% vs last month</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Customer Satisfaction</span>
            <div className="stat-icon orange">
              <Star size={20} />
            </div>
          </div>
          <div className="stat-value">{dashboardStats.customerSatisfaction}</div>
          <div className="stat-change positive">+0.2 from Q4</div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="panel">
          <div className="panel-header">
            <h3>Priority Cases</h3>
            <button className="view-all-btn" onClick={() => navigate("/cases")}>
              View all
            </button>
          </div>
          <div className="panel-body">
            {priorityCases.map((c) => (
              <div
                key={c.id}
                className="priority-case-item"
                onClick={() => navigate(`/cases/${c.id}`)}
              >
                <div className="priority-case-title">{c.title}</div>
                <div className="priority-case-meta">
                  <span>{c.id}</span>
                  <span>
                    <span
                      className={`badge badge-${c.priority.toLowerCase()}`}
                    >
                      {c.priority}
                    </span>
                  </span>
                  <span>
                    <span
                      className={`badge badge-${c.status
                        .toLowerCase()
                        .replace(" ", "-")}`}
                    >
                      {c.status}
                    </span>
                  </span>
                  <span>{c.assignee}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <h3>Recent Activity</h3>
          </div>
          <div className="panel-body">
            {recentActivity.map((item) => (
              <div key={item.id} className="activity-item">
                <div className={`activity-dot ${item.type}`}></div>
                <span className="activity-text">{item.text}</span>
                <span className="activity-time">{item.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
