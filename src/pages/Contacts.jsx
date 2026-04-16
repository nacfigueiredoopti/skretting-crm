import { Mail, Phone, MapPin, Briefcase } from "lucide-react";
import { contacts } from "../data/mockData";

const avatarColors = ["green", "blue", "orange"];

export default function Contacts() {
  return (
    <div className="page-content">
      <div className="filter-bar">
        <span style={{ fontSize: 13, color: "#6b7280" }}>
          {contacts.length} contacts
        </span>
      </div>

      <div className="contacts-grid">
        {contacts.map((contact, i) => (
          <div key={contact.id} className="contact-card-full">
            <div className="card-top">
              <div
                className="avatar-large"
                style={{
                  background:
                    avatarColors[i % 3] === "green"
                      ? "#00843D"
                      : avatarColors[i % 3] === "blue"
                      ? "#003057"
                      : "#FF6B00",
                }}
              >
                {contact.avatar}
              </div>
              <div>
                <div className="card-name">{contact.name}</div>
                <div className="card-company">{contact.company}</div>
              </div>
            </div>

            <div className="card-details">
              <div className="card-detail">
                <Briefcase size={14} /> {contact.role}
              </div>
              <div className="card-detail">
                <Mail size={14} /> {contact.email}
              </div>
              <div className="card-detail">
                <Phone size={14} /> {contact.phone}
              </div>
              <div className="card-detail">
                <MapPin size={14} /> {contact.region}
              </div>
            </div>

            <div className="card-footer">
              <span className="card-region">
                Last contact: {contact.lastContact}
              </span>
              <span
                className={`badge badge-${contact.status.toLowerCase()}`}
              >
                {contact.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
