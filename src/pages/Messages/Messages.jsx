import { useState, useEffect } from "react";
import "./Messages.css";

const STATUS_STEPS = [
  { key: "submitted", label: "Submitted" },
  { key: "review", label: "Under Review" },
  { key: "confirmed", label: "Confirmed" },
  { key: "production", label: "In Production" },
  { key: "delivery", label: "Out for Delivery" },
  { key: "delivered", label: "Delivered" },
];

function getStepIndex(status) {
  const s = (status || "").toLowerCase();
  if (s.includes("delivered") && !s.includes("out")) return 5;
  if (s.includes("out")) return 4;
  if (s.includes("produc")) return 3;
  if (s.includes("confirm")) return 2;
  if (s.includes("review")) return 1;
  return 0;
}

export default function Messages({ user, navigateTo }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    loadRequests();
  }, [user]);

  async function loadRequests() {
    if (!user?.isLoggedIn) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      // Fetch purchase requests matching the logged in client's email
      const res = await fetch(
        `http://localhost:3000/api/purchase_requests?email=${encodeURIComponent(user.email)}`,
      );
      const list = await res.json();
      const sorted = Array.isArray(list) ? list : [];
      setRequests(sorted);
      if (sorted.length > 0) setSelected(sorted[0]);
      else setSelected(null);
    } catch (err) {
      console.error("Error loading messages from Express:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!selected) return;
    setDeleting(true);
    try {
      await fetch(
        `http://localhost:3000/api/purchase_requests/${selected.id}`,
        {
          method: "DELETE",
        },
      );
      const updated = requests.filter((r) => r.id !== selected.id);
      setRequests(updated);
      setSelected(updated.length > 0 ? updated[0] : null);
      setShowDeleteConfirm(false);
    } catch (err) {
      console.error("Error deleting request:", err);
    } finally {
      setDeleting(false);
    }
  }

  const formatDate = (dateVal) => {
    if (!dateVal) return "—";
    if (typeof dateVal === "string") {
      return new Date(dateVal).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
    return "—";
  };

  const stepIndex = selected ? getStepIndex(selected.status) : 0;

  if (!user?.isLoggedIn) {
    return (
      <div className="msg-empty-page">
        <div className="msg-empty-box">
          <span className="msg-empty-icon">📭</span>
          <h2>Sign In Required</h2>
          <p>Please sign in to view your purchase request messages.</p>
          <button className="msg-cta-btn" onClick={() => navigateTo("login")}>
            Sign In →
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="msg-empty-page">
        <div className="msg-spinner" />
        <p className="msg-loading-text">Loading your messages...</p>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="msg-empty-page">
        <div className="msg-empty-box">
          <span className="msg-empty-icon">📬</span>
          <h2>No Messages Yet</h2>
          <p>
            Submit a purchase request from any vehicle detail page and your
            messages will appear here.
          </p>
          <button className="msg-cta-btn" onClick={() => navigateTo("models")}>
            Browse Models →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="msg-layout">
      <div className="msg-page-header">
        <span className="msg-eyebrow">McLAREN CLIENT CONCIERGE</span>
        <h1>YOUR MESSAGES</h1>
        <p>
          {requests.length} purchase request{requests.length > 1 ? "s" : ""} on
          file
        </p>
      </div>

      <div className="msg-content">
        <div className="msg-list">
          {requests.map((req) => (
            <button
              key={req.id}
              className={`msg-list-item ${selected?.id === req.id ? "active" : ""}`}
              onClick={() => {
                setSelected(req);
                setShowDeleteConfirm(false);
              }}
            >
              <div className="msg-list-top">
                <span className="msg-list-car">
                  {req.vehicleName || req.carModel || "McLaren Vehicle"}
                </span>
                <span
                  className={`msg-list-status ${getStepIndex(req.status) >= 2 ? "confirmed" : "pending"}`}
                >
                  {req.status || "Pending"}
                </span>
              </div>
              <span className="msg-list-date">
                {formatDate(req.submittedAt)}
              </span>
              <span className="msg-list-preview">
                {req.deliveryRegion || "Region not specified"} ·{" "}
                {req.exteriorColor || "Colour not specified"}
              </span>
            </button>
          ))}
        </div>

        {selected && (
          <div className="msg-detail">
            <div className="msg-detail-header">
              <div>
                <span className="msg-detail-eyebrow">PURCHASE REQUEST</span>
                <h2>
                  {selected.vehicleName ||
                    selected.carModel ||
                    "McLaren Vehicle"}
                </h2>
                <span className="msg-detail-date">
                  Submitted: {formatDate(selected.submittedAt)}
                </span>
              </div>
              <div className="msg-detail-header-right">
                <span
                  className={`msg-detail-status-badge ${getStepIndex(selected.status) >= 2 ? "confirmed" : "pending"}`}
                >
                  {selected.status || "Pending Review"}
                </span>
                <button
                  className="msg-delete-btn"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  Delete Request
                </button>
              </div>
            </div>

            {showDeleteConfirm && (
              <div className="msg-delete-confirm">
                <p>Are you sure you want to delete this purchase request?</p>
                <div className="msg-delete-confirm-btns">
                  <button
                    className="msg-delete-confirm-yes"
                    onClick={handleDelete}
                    disabled={deleting}
                  >
                    {deleting ? "Deleting..." : "Yes, Delete"}
                  </button>
                  <button
                    className="msg-delete-confirm-no"
                    onClick={() => setShowDeleteConfirm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="msg-summary-block">
              <h3>REQUEST DETAILS</h3>
              <div className="msg-summary-grid">
                <div className="msg-summary-row">
                  <span>Client Name</span>
                  <strong>{selected.clientName || "—"}</strong>
                </div>
                <div className="msg-summary-row">
                  <span>Email</span>
                  <strong>{selected.clientEmail || user.email}</strong>
                </div>
                <div className="msg-summary-row">
                  <span>Vehicle</span>
                  <strong>
                    {selected.vehicleName || selected.carModel || "—"}
                  </strong>
                </div>
                <div className="msg-summary-row">
                  <span>Exterior Colour</span>
                  <strong>{selected.exteriorColor || "—"}</strong>
                </div>
                <div className="msg-summary-row">
                  <span>Delivery Region</span>
                  <strong>{selected.deliveryRegion || "—"}</strong>
                </div>
              </div>
            </div>

            <div className="msg-response-block">
              <div className="msg-response-avatar">MC</div>
              <div className="msg-response-bubble">
                <p className="msg-response-from">McLaren Client Concierge</p>
                <div className="msg-response-text">
                  <p>
                    Dear{" "}
                    <strong>
                      {selected.clientName || user.name || "Valued Client"}
                    </strong>
                    ,
                  </p>
                  <p>
                    Thank you for your purchase inquiry for the{" "}
                    <strong>{selected.vehicleName || selected.carModel}</strong>
                    . Our McLaren specialists are currently reviewing your
                    specification notes.
                  </p>
                </div>
              </div>
            </div>

            <div className="msg-status-tracker">
              <h3>ORDER STATUS</h3>
              <div className="msg-status-steps">
                {STATUS_STEPS.map((step, idx) => (
                  <div
                    key={step.key}
                    className={`msg-step ${idx <= stepIndex ? "done" : ""} ${idx === stepIndex ? "current" : ""}`}
                  >
                    <div className="msg-step-dot">
                      {idx < stepIndex ? "✓" : idx + 1}
                    </div>
                    <span className="msg-step-label">{step.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
