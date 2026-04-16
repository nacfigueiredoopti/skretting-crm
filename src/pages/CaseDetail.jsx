import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  User,
  Tag,
  Clock,
  FileText,
  Image,
  Film,
  File,
  ExternalLink,
  Loader2,
  CloudOff,
} from "lucide-react";
import { cases } from "../data/mockData";

const ASSET_TYPE_ICONS = {
  image: Image,
  video: Film,
  raw_file: File,
  article: FileText,
  structured_content: FileText,
};

function DamAssets({ caseNumber }) {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!caseNumber) {
      setLoading(false);
      return;
    }

    const fetchAssets = async () => {
      try {
        const res = await fetch(
          `/.netlify/functions/dam-assets?case_number=${encodeURIComponent(caseNumber)}`
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to fetch");
        setAssets(data.assets || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAssets();
  }, [caseNumber]);

  if (loading) {
    return (
      <div className="case-sidebar-card">
        <h4>DAM Assets</h4>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 0", fontSize: 13, color: "#6b7280" }}>
          <Loader2 size={16} className="spin" /> Searching Optimizely DAM...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="case-sidebar-card">
        <h4>DAM Assets</h4>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 0", fontSize: 13, color: "#9ca3af" }}>
          <CloudOff size={16} /> DAM not connected
        </div>
        <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>
          Configure OPTIMIZELY_DAM_CLIENT_ID and OPTIMIZELY_DAM_CLIENT_SECRET in Netlify environment variables.
        </div>
      </div>
    );
  }

  return (
    <div className="case-sidebar-card">
      <h4>DAM Assets ({assets.length})</h4>
      {assets.length === 0 ? (
        <div style={{ fontSize: 13, color: "#9ca3af", padding: "8px 0" }}>
          No assets linked to case #{caseNumber}
        </div>
      ) : (
        assets.map((asset) => {
          const Icon = ASSET_TYPE_ICONS[asset.type] || File;
          return (
            <a
              key={asset.id}
              href={asset.dam_url}
              target="_blank"
              rel="noopener noreferrer"
              className="dam-asset-item"
            >
              <div className="dam-asset-icon">
                <Icon size={18} />
              </div>
              <div className="dam-asset-info">
                <div className="dam-asset-name">{asset.name}</div>
                <div className="dam-asset-type">{asset.type?.replace("_", " ")}</div>
              </div>
              <ExternalLink size={14} style={{ color: "#9ca3af", flexShrink: 0 }} />
            </a>
          );
        })
      )}
    </div>
  );
}

export default function CaseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const caseData = cases.find((c) => c.id === id);
  const [newNote, setNewNote] = useState("");
  const [notes, setNotes] = useState(caseData?.notes || []);

  if (!caseData) {
    return (
      <div className="page-content">
        <button className="back-btn" onClick={() => navigate("/cases")}>
          <ArrowLeft size={16} /> Back to Cases
        </button>
        <p>Case not found.</p>
      </div>
    );
  }

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    setNotes([
      ...notes,
      {
        id: notes.length + 1,
        author: "Ingrid Solberg",
        date: new Date().toISOString(),
        text: newNote,
      },
    ]);
    setNewNote("");
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="page-content">
      <button className="back-btn" onClick={() => navigate("/cases")}>
        <ArrowLeft size={16} /> Back to Cases
      </button>

      <div className="case-detail-header">
        <div>
          <h2>{caseData.title}</h2>
          <div className="case-meta">
            <span className="case-meta-item">
              <Tag size={14} /> {caseData.id}
            </span>
            {caseData.caseNumber && (
              <span className="case-meta-item">
                <FileText size={14} /> NF-{caseData.caseNumber}
              </span>
            )}
            <span className="case-meta-item">
              <Calendar size={14} /> Created {caseData.created}
            </span>
            <span className="case-meta-item">
              <Clock size={14} /> Updated {caseData.updated}
            </span>
            <span className="case-meta-item">
              <User size={14} /> {caseData.assignee}
            </span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <span
            className={`badge badge-${caseData.status
              .toLowerCase()
              .replace(" ", "-")}`}
          >
            {caseData.status}
          </span>
          <span
            className={`badge badge-${caseData.priority.toLowerCase()}`}
          >
            {caseData.priority}
          </span>
        </div>
      </div>

      <div className="case-detail-grid">
        <div>
          <div className="case-description">
            <h4>Description</h4>
            <p>{caseData.description}</p>
          </div>

          <div className="notes-section">
            <h4>Notes ({notes.length})</h4>
            {notes.map((note) => (
              <div key={note.id} className="note-item">
                <div className="note-header">
                  <span className="note-author">{note.author}</span>
                  <span className="note-date">{formatDate(note.date)}</span>
                </div>
                <div className="note-text">{note.text}</div>
              </div>
            ))}
            <div className="add-note-form">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add a note..."
              />
              <div className="form-actions">
                <button className="btn-primary" onClick={handleAddNote}>
                  Add Note
                </button>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="case-sidebar-card">
            <h4>Case Details</h4>
            <div className="detail-row">
              <span className="label">Status</span>
              <span className="value">{caseData.status}</span>
            </div>
            <div className="detail-row">
              <span className="label">Priority</span>
              <span className="value">{caseData.priority}</span>
            </div>
            <div className="detail-row">
              <span className="label">Category</span>
              <span className="value">{caseData.category}</span>
            </div>
            <div className="detail-row">
              <span className="label">Assignee</span>
              <span className="value">{caseData.assignee}</span>
            </div>
            {caseData.caseNumber && (
              <div className="detail-row">
                <span className="label">NF Case #</span>
                <span className="value">{caseData.caseNumber}</span>
              </div>
            )}
            <div className="detail-row">
              <span className="label">Created</span>
              <span className="value">{caseData.created}</span>
            </div>
            <div className="detail-row">
              <span className="label">Last Updated</span>
              <span className="value">{caseData.updated}</span>
            </div>
          </div>

          <DamAssets caseNumber={caseData.caseNumber} />

          <div className="case-sidebar-card">
            <h4>Contact</h4>
            <div className="contact-card">
              <div className="avatar green">{caseData.contact.avatar}</div>
              <div className="contact-info">
                <div className="contact-name">{caseData.contact.name}</div>
                <div className="contact-company">
                  {caseData.contact.company}
                </div>
              </div>
            </div>
            <div className="detail-row">
              <span className="label">Email</span>
              <span className="value" style={{ fontSize: 12 }}>
                {caseData.contact.email}
              </span>
            </div>
            <div className="detail-row">
              <span className="label">Phone</span>
              <span className="value">{caseData.contact.phone}</span>
            </div>
            <div className="detail-row">
              <span className="label">Region</span>
              <span className="value">{caseData.contact.region}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
