/* eslint-disable react-hooks/immutability */
import { useState, useEffect } from "react";
import { db } from "../../firebase/config";
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function loadRequests() {
    if (!user?.isLoggedIn) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const q = query(
        collection(db, "purchase_requests"),
        where("clientEmail", "==", user.email),
      );
      const snap = await getDocs(q);
      const list = [];
      snap.forEach((d) => list.push({ id: d.id, ...d.data() }));
      list.sort(
        (a, b) => (b.submittedAt?.seconds || 0) - (a.submittedAt?.seconds || 0),
      );
      setRequests(list);
      if (list.length > 0) setSelected(list[0]);
      else setSelected(null);
    } catch (err) {
      console.error("Error loading messages:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!selected) return;
    setDeleting(true);
    try {
      await deleteDoc(doc(db, "purchase_requests", selected.id));
      const updated = requests.filter((r) => r.id !== selected.id);
      setRequests(updated);
      setSelected(updated.length > 0 ? updated[0] : null);
      setShowDeleteConfirm(false);
    } catch (err) {
      console.error("Error deleting:", err);
    } finally {
      setDeleting(false);
    }
  }

  const formatDate = (dateVal) => {
    if (!dateVal) return "—";
    if (typeof dateVal?.toDate === "function") {
      return dateVal.toDate().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
    return typeof dateVal === "string" ? dateVal : "—";
  };

  const stepIndex = selected ? getStepIndex(selected.status) : 0;
  const isConfirmed = stepIndex >= 2;
  const isDelivered = stepIndex >= 5;

  // NOT LOGGED IN
  if (!user?.isLoggedIn) {
    return (
      <div className="msg-empty-page">
        <div className="msg-empty-box">
          <span className="msg-empty-icon">📭</span>
          <h2>Sign In Required</h2>
          <p>Please sign in to view your purchase request messages.</p>
          <button className="msg-cta-btn" onClick={() => navigateTo("account")}>
            Sign In →
          </button>
        </div>
      </div>
    );
  }

  // LOADING
  if (loading) {
    return (
      <div className="msg-empty-page">
        <div className="msg-spinner" />
        <p className="msg-loading-text">Loading your messages...</p>
      </div>
    );
  }

  // NO MESSAGES
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
      {/* PAGE HEADER */}
      <div className="msg-page-header">
        <span className="msg-eyebrow">McLAREN CLIENT CONCIERGE</span>
        <h1>YOUR MESSAGES</h1>
        <p>
          {requests.length} purchase request{requests.length > 1 ? "s" : ""} on
          file
        </p>
      </div>

      <div className="msg-content">
        {/* LEFT SIDEBAR */}
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

        {/* RIGHT DETAIL */}
        {selected && (
          <div className="msg-detail">
            {/* DETAIL HEADER */}
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

            {/* DELETE CONFIRM */}
            {showDeleteConfirm && (
              <div className="msg-delete-confirm">
                <p>
                  Are you sure you want to delete this purchase request? This
                  cannot be undone.
                </p>
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

            {/* REQUEST SUMMARY */}
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
                {selected.additionalNotes && (
                  <div className="msg-summary-row">
                    <span>Additional Notes</span>
                    <strong>{selected.additionalNotes}</strong>
                  </div>
                )}
              </div>
            </div>

            {/* AI RESPONSE */}
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
                      {selected.vehicleName ||
                        selected.carModel ||
                        "McLaren vehicle"}
                    </strong>
                    . We have received your request and our specialist team is
                    currently reviewing your submission.
                  </p>
                  <p>
                    Your preferred exterior finish of{" "}
                    <strong>
                      {selected.exteriorColor || "your selected colour"}
                    </strong>{" "}
                    has been noted, along with your delivery preference for the{" "}
                    <strong>
                      {selected.deliveryRegion || "selected region"}
                    </strong>
                    .
                  </p>
                  <p>
                    A dedicated McLaren client specialist will be in contact at{" "}
                    <strong>{selected.clientEmail || user.email}</strong> within
                    1–3 business days.
                  </p>
                  <p className="msg-response-sign">
                    Warm regards,
                    <br />
                    <strong>McLaren Client Concierge</strong>
                    <br />
                    McLaren Automotive, Woking
                  </p>
                </div>
              </div>
            </div>

            {/* STATUS TRACKER */}
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
                    {idx < STATUS_STEPS.length - 1 && (
                      <div
                        className={`msg-step-line ${idx < stepIndex ? "done" : ""}`}
                      />
                    )}
                    <span className="msg-step-label">{step.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="msg-actions">
              <div
                className={`msg-action-card ${!isConfirmed ? "locked" : ""}`}
              >
                <div className="msg-action-card-info">
                  <h4>Configure Your Car</h4>
                  <p>
                    {isConfirmed
                      ? "Your request is confirmed. Customise your McLaren now."
                      : "Unlocks once our team confirms your request."}
                  </p>
                </div>
                <button
                  className={`msg-action-btn ${!isConfirmed ? "locked" : ""}`}
                  disabled={!isConfirmed}
                  onClick={() => isConfirmed && navigateTo("configure")}
                >
                  {isConfirmed ? "Configure Now →" : "🔒 Pending Confirmation"}
                </button>
              </div>

              <div
                className={`msg-action-card ${!isDelivered ? "locked" : ""}`}
              >
                <div className="msg-action-card-info">
                  <h4>Proceed to Checkout</h4>
                  <p>
                    {isDelivered
                      ? "Your vehicle is ready. Complete delivery details."
                      : "Unlocks once your vehicle is ready for delivery."}
                  </p>
                </div>
                <button
                  className={`msg-action-btn ${!isDelivered ? "locked" : ""}`}
                  disabled={!isDelivered}
                  onClick={() => isDelivered && navigateTo("checkout")}
                >
                  {isDelivered ? "Checkout →" : "🔒 Pending Delivery"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
