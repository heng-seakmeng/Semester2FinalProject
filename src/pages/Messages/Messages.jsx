import { useState, useEffect } from "react";
import "./Messages.css";

const API_BASE = `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api`;

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
  // "purchase" = purchase request order tracking (existing behavior)
  // "inquiries" = contact form messages + any admin reply on them
  const [activeTab, setActiveTab] = useState("purchase");

  const [requests, setRequests] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inquiriesLoading, setInquiriesLoading] = useState(true);

  const [selected, setSelected] = useState(null);
  const [selectedInquiry, setSelectedInquiry] = useState(null);

  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    loadRequests();
    loadInquiries();
  }, [user]);

  async function loadRequests() {
    if (!user?.isLoggedIn) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE}/purchase-requests?email=${encodeURIComponent(user.email)}`,
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

  // Contact form inquiries the client submitted, plus any admin reply —
  // matched to their account by email on the backend. Requires the
  // session token (same pattern AdminDashboard uses for admin routes).
  async function loadInquiries() {
    if (!user?.isLoggedIn) {
      setInquiriesLoading(false);
      return;
    }
    setInquiriesLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/my-inquiries`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) {
        setInquiries([]);
        return;
      }
      const list = await res.json();
      const sorted = Array.isArray(list) ? list : [];
      setInquiries(sorted);
      if (sorted.length > 0) setSelectedInquiry(sorted[0]);
      else setSelectedInquiry(null);
    } catch (err) {
      console.error("Error loading contact inquiries:", err);
    } finally {
      setInquiriesLoading(false);
    }
  }

  async function handleDelete() {
    if (!selected) return;
    setDeleting(true);
    try {
      await fetch(`${API_BASE}/purchase-requests/${selected.id}`, {
        method: "DELETE",
      });
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

  const formatDateTime = (dateVal) => {
    if (!dateVal) return "—";
    return new Date(dateVal).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const stepIndex = selected ? getStepIndex(selected.status) : 0;
  const isConfirmed = stepIndex >= 2;
  const hasCheckedOut = !!selected?.hasCheckedOut;

  if (!user?.isLoggedIn) {
    return (
      <div className="msg-empty-page">
        <div className="msg-empty-box">
          <span className="msg-empty-icon">📭</span>
          <h2>Sign In Required</h2>
          <p>Please sign in to view your messages.</p>
          <button className="msg-cta-btn" onClick={() => navigateTo("login")}>
            Sign In →
          </button>
        </div>
      </div>
    );
  }

  const isLoadingActiveTab =
    activeTab === "purchase" ? loading : inquiriesLoading;

  if (isLoadingActiveTab) {
    return (
      <div className="msg-empty-page">
        <div className="msg-spinner" />
        <p className="msg-loading-text">Loading your messages...</p>
      </div>
    );
  }

  const nothingAtAll =
    activeTab === "purchase" ? requests.length === 0 : inquiries.length === 0;

  return (
    <div className="msg-layout">
      <div className="msg-page-header">
        <span className="msg-eyebrow">McLAREN CLIENT CONCIERGE</span>
        <h1>YOUR MESSAGES</h1>
        <p>
          {activeTab === "purchase"
            ? `${requests.length} purchase request${requests.length !== 1 ? "s" : ""} on file`
            : `${inquiries.length} contact message${inquiries.length !== 1 ? "s" : ""} on file`}
        </p>

        <div
          style={{
            display: "flex",
            gap: "0.75rem",
            marginTop: "1.5rem",
          }}
        >
          <button
            className="msg-cta-btn"
            style={
              activeTab !== "purchase"
                ? { background: "transparent", color: "#8c8c88" }
                : undefined
            }
            onClick={() => setActiveTab("purchase")}
          >
            Purchase Requests
          </button>
          <button
            className="msg-cta-btn"
            style={
              activeTab !== "inquiries"
                ? { background: "transparent", color: "#8c8c88" }
                : undefined
            }
            onClick={() => setActiveTab("inquiries")}
          >
            Contact Messages
          </button>
        </div>
      </div>

      {nothingAtAll ? (
        <div className="msg-empty-page">
          <div className="msg-empty-box">
            <span className="msg-empty-icon">📬</span>
            <h2>No Messages Yet</h2>
            {activeTab === "purchase" ? (
              <>
                <p>
                  Submit a purchase request from any vehicle detail page and
                  your messages will appear here.
                </p>
                <button
                  className="msg-cta-btn"
                  onClick={() => navigateTo("models")}
                >
                  Browse Models →
                </button>
              </>
            ) : (
              <>
                <p>
                  Send us a message from the Contact page and any reply from our
                  team will appear here.
                </p>
                <button
                  className="msg-cta-btn"
                  onClick={() => navigateTo("contact")}
                >
                  Go to Contact →
                </button>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="msg-content">
          <div className="msg-list">
            {activeTab === "purchase"
              ? requests.map((req) => (
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
                ))
              : inquiries.map((inq) => (
                  <button
                    key={inq.id}
                    className={`msg-list-item ${selectedInquiry?.id === inq.id ? "active" : ""}`}
                    onClick={() => setSelectedInquiry(inq)}
                  >
                    <div className="msg-list-top">
                      <span className="msg-list-car">
                        {inq.subject || "General Inquiry"}
                      </span>
                      <span
                        className={`msg-list-status ${inq.reply ? "confirmed" : "pending"}`}
                      >
                        {inq.reply ? "Replied" : "Awaiting Reply"}
                      </span>
                    </div>
                    <span className="msg-list-date">
                      {formatDate(inq.submittedAt)}
                    </span>
                    <span className="msg-list-preview">{inq.message}</span>
                  </button>
                ))}
          </div>

          {activeTab === "purchase" && selected && (
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
                      <strong>
                        {selected.vehicleName || selected.carModel}
                      </strong>
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

              {/* ACTION CARD: Checkout only */}
              <div className="msg-actions">
                <div
                  className={`msg-action-card ${!isConfirmed ? "locked" : ""}`}
                >
                  <div className="msg-action-card-info">
                    <h4>Proceed to Checkout</h4>
                    <p>
                      {hasCheckedOut
                        ? "Delivery details submitted. Our team will confirm scheduling shortly."
                        : isConfirmed
                          ? "Your request is confirmed. Enter your delivery details to continue."
                          : "Unlocks once our team confirms your request."}
                    </p>
                  </div>
                  <button
                    className={`msg-action-btn ${!isConfirmed ? "locked" : ""}`}
                    disabled={!isConfirmed}
                    onClick={() =>
                      isConfirmed && navigateTo("checkout", selected.id)
                    }
                  >
                    {!isConfirmed
                      ? "🔒 Pending Confirmation"
                      : hasCheckedOut
                        ? "Edit Delivery Details →"
                        : "Checkout →"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "inquiries" && selectedInquiry && (
            <div className="msg-detail">
              <div className="msg-detail-header">
                <div>
                  <span className="msg-detail-eyebrow">CONTACT MESSAGE</span>
                  <h2>{selectedInquiry.subject || "General Inquiry"}</h2>
                  <span className="msg-detail-date">
                    Submitted: {formatDate(selectedInquiry.submittedAt)}
                  </span>
                </div>
                <div className="msg-detail-header-right">
                  <span
                    className={`msg-detail-status-badge ${selectedInquiry.reply ? "confirmed" : "pending"}`}
                  >
                    {selectedInquiry.reply ? "Replied" : "Awaiting Reply"}
                  </span>
                </div>
              </div>

              <div className="msg-summary-block">
                <h3>YOUR MESSAGE</h3>
                <p
                  style={{
                    color: "#f7f6f3",
                    fontWeight: 300,
                    lineHeight: 1.8,
                    fontSize: "0.95rem",
                  }}
                >
                  {selectedInquiry.message}
                </p>
              </div>

              <div className="msg-response-block">
                <div className="msg-response-avatar">MC</div>
                <div className="msg-response-bubble">
                  <p className="msg-response-from">McLaren Client Concierge</p>
                  <div className="msg-response-text">
                    {selectedInquiry.reply ? (
                      <>
                        <p>
                          Dear{" "}
                          <strong>
                            {selectedInquiry.fullName ||
                              user.name ||
                              "Valued Client"}
                          </strong>
                          ,
                        </p>
                        <p>{selectedInquiry.reply}</p>
                        {selectedInquiry.repliedAt && (
                          <p
                            className="msg-response-sign"
                            style={{ fontSize: "0.8rem" }}
                          >
                            Replied {formatDateTime(selectedInquiry.repliedAt)}
                          </p>
                        )}
                      </>
                    ) : (
                      <p>
                        Thank you for reaching out. A McLaren specialist is
                        reviewing your message and will reply here shortly.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
