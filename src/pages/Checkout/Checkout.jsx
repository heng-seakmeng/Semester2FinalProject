import { useState, useEffect } from "react";
import "./Checkout.css";

const API_BASE = `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api`;

export default function Checkout({ requestId, navigateTo }) {
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [fullAddress, setFullAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [phone, setPhone] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [instructions, setInstructions] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    async function loadRequest() {
      if (!requestId) {
        setLoadError("No purchase request selected.");
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/purchase-requests/${requestId}`);
        if (!res.ok) {
          setLoadError("Could not find that purchase request.");
          setLoading(false);
          return;
        }
        const data = await res.json();
        setRequest(data);

        if (data.delivery) {
          setFullAddress(data.delivery.fullAddress || "");
          setCity(data.delivery.city || "");
          setState(data.delivery.state || "");
          setCountry(data.delivery.country || "");
          setPostalCode(data.delivery.postalCode || "");
          setPhone(data.delivery.phone || "");
          setPreferredDate(data.delivery.preferredDate || "");
          setInstructions(data.delivery.instructions || "");
        }
      } catch (err) {
        console.error("Error loading purchase request:", err);
        setLoadError("Could not reach the server. Is it running on port 3000?");
      } finally {
        setLoading(false);
      }
    }
    loadRequest();
  }, [requestId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    setSubmitting(true);

    const token = localStorage.getItem("token");
    if (!token) {
      setSubmitError("Your session expired. Please sign in again.");
      setSubmitting(false);
      navigateTo("login");
      return;
    }

    try {
      const res = await fetch(
        `${API_BASE}/purchase-requests/${requestId}/checkout`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            delivery: {
              fullAddress,
              city,
              state,
              country,
              postalCode,
              phone,
              preferredDate,
              instructions,
            },
          }),
        },
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setSubmitError(data.error || "Failed to save delivery details.");
        return;
      }

      setSubmitted(true);
    } catch (err) {
      console.error("Error submitting checkout:", err);
      setSubmitError("Could not reach the server. Is it running on port 3000?");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="checkout-status-page">
        <div className="checkout-spinner" />
        <p>Loading your order...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="checkout-status-page">
        <div className="checkout-status-box">
          <span className="checkout-status-icon">⚠️</span>
          <h2>Something's Missing</h2>
          <p>{loadError}</p>
          <button
            className="checkout-cta-btn"
            onClick={() => navigateTo("messages")}
          >
            Back to Messages →
          </button>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="checkout-status-page">
        <div className="checkout-status-box">
          <span className="checkout-status-icon">✓</span>
          <h2>Delivery Details Submitted</h2>
          <p>
            Thank you. Your McLaren Client Specialist will confirm scheduling
            for your{" "}
            <strong>{request?.vehicleName || request?.carModel}</strong>{" "}
            shortly.
          </p>
          <button
            className="checkout-cta-btn"
            onClick={() => navigateTo("messages")}
          >
            Back to Messages →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-layout">
      <div className="checkout-page-header">
        <span className="checkout-eyebrow">McLAREN CLIENT CONCIERGE</span>
        <h1>DELIVERY DETAILS</h1>
        <p>
          Checkout for your{" "}
          <strong>{request?.vehicleName || request?.carModel}</strong>
        </p>
      </div>

      <div className="checkout-content">
        <form className="checkout-form" onSubmit={handleSubmit}>
          {submitError && <p className="checkout-error">{submitError}</p>}

          <div className="checkout-field">
            <label>Full Delivery Address *</label>
            <input
              type="text"
              required
              placeholder="123 Woking Lane"
              value={fullAddress}
              onChange={(e) => setFullAddress(e.target.value)}
            />
          </div>

          <div className="checkout-field-row">
            <div className="checkout-field">
              <label>City *</label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>
            <div className="checkout-field">
              <label>State / Province</label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
              />
            </div>
          </div>

          <div className="checkout-field-row">
            <div className="checkout-field">
              <label>Country *</label>
              <input
                type="text"
                required
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              />
            </div>
            <div className="checkout-field">
              <label>Postal Code *</label>
              <input
                type="text"
                required
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
              />
            </div>
          </div>

          <div className="checkout-field-row">
            <div className="checkout-field">
              <label>Phone Number *</label>
              <input
                type="tel"
                required
                placeholder="+1 555 000 0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className="checkout-field">
              <label>Preferred Delivery Date</label>
              <input
                type="date"
                value={preferredDate}
                onChange={(e) => setPreferredDate(e.target.value)}
              />
            </div>
          </div>

          <div className="checkout-field">
            <label>Special Instructions (Optional)</label>
            <textarea
              rows={3}
              placeholder="Gate code, preferred delivery window, etc."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
            />
          </div>

          <p className="checkout-note">
            Payment is handled separately by your McLaren specialist — this form
            only confirms where and when to deliver your vehicle.
          </p>

          <div className="checkout-actions">
            <button
              type="button"
              className="checkout-cancel-btn"
              onClick={() => navigateTo("messages")}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="checkout-submit-btn"
              disabled={submitting}
            >
              {submitting ? "Saving..." : "Confirm Delivery Details →"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
