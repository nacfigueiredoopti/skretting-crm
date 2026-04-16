import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cases } from "../data/mockData";

export default function Cases() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("All");

  const filters = ["All", "Open", "In Progress", "Resolved"];
  const filtered =
    filter === "All" ? cases : cases.filter((c) => c.status === filter);

  return (
    <div className="page-content">
      <div className="filter-bar">
        {filters.map((f) => (
          <button
            key={f}
            className={`filter-btn ${filter === f ? "active" : ""}`}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
        <span style={{ marginLeft: "auto", fontSize: 13, color: "#6b7280" }}>
          {filtered.length} case{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="panel">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Case ID</th>
                <th>Title</th>
                <th>Contact</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Category</th>
                <th>Assignee</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} onClick={() => navigate(`/cases/${c.id}`)}>
                  <td style={{ fontWeight: 600, color: "#003057" }}>{c.id}</td>
                  <td style={{ maxWidth: 280 }}>{c.title}</td>
                  <td>{c.contact.name}</td>
                  <td>
                    <span
                      className={`badge badge-${c.status
                        .toLowerCase()
                        .replace(" ", "-")}`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`badge badge-${c.priority.toLowerCase()}`}
                    >
                      {c.priority}
                    </span>
                  </td>
                  <td>{c.category}</td>
                  <td>{c.assignee}</td>
                  <td>{c.updated}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
