import { useState, useEffect } from "react";
import "./Account.css";

const API_BASE = "http://localhost:3000/api";

export default function Account({ user, setUser, navigateTo }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [purchaseRequests, setPurchaseRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(false);

  useEffect(() => {
    async function loadPurchaseRequests() {
      if (!user.isLoggedIn) return;
      setRequestsLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE}/purchase-requests`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) setPurchaseRequests(data);
      } catch (err) {
        console.error("Error loading purchase requests:", err);
      } finally {
        setRequestsLoading(false);
      }
    }
    loadPurchaseRequests();
  }, [user]);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const endpoint = isRegistering ? "/auth/signup" : "/auth/login";
      const body = isRegistering
        ? { name: fullName, email, password }
        : { email, password };

      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Authentication error. Please try again.");
        return;
      }

      localStorage.setItem("token", data.token);
      setUser({
        isLoggedIn: true,
        uid: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role || "client", // ✅ Fixed: role now saved
      });
    } catch {
      setError("Could not reach the server. Is it running on port 3000?");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Please enter your email address first.");
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to send reset email.");
        return;
      }
      setSuccessMsg("Password reset email sent. Check your inbox.");
      setError("");
    } catch {
      setError("Failed to send reset email. Check your address.");
    }
  };

  const handleLogout = async () => {
    const token = localStorage.getItem("token");
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      // ignore network errors on logout
    }
    localStorage.removeItem("token");
    setUser({
      isLoggedIn: false,
      uid: null,
      name: "",
      email: "",
      role: "client",
    });
    if (navigateTo) navigateTo("home");
  };

  const formatDate = (dateVal) => {
    if (!dateVal) return "—";
    const d = new Date(dateVal);
    if (isNaN(d)) return typeof dateVal === "string" ? dateVal : "—";
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusClass = (status) => {
    const s = (status || "pending").toLowerCase();
    if (s === "confirmed" || s === "delivered") return "status-confirmed";
    if (s === "in production" || s === "out for delivery")
      return "status-processing";
    return "status-pending";
  };

  // ── LOGGED OUT VIEW ──
  if (!user.isLoggedIn) {
    return (
      <div className="auth-view-container">
        <div className="auth-box">
          <span className="auth-eyebrow">
            {isRegistering ? "COLLECTOR REGISTRATION" : "CLIENT ACCESS"}
          </span>
          <h2>{isRegistering ? "CREATE ACCOUNT" : "SIGN IN"}</h2>
          <p className="auth-subtext">
            {isRegistering
              ? "Register to track your purchase requests and manage your McLaren journey."
              : "Sign in to access your account and purchase requests."}
          </p>

          {error && <p className="auth-error">{error}</p>}
          {successMsg && <p className="auth-success">{successMsg}</p>}

          <form onSubmit={handleAuthSubmit} className="auth-styled-form">
            {isRegistering && (
              <div className="auth-field">
                <label>Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="James W."
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
            )}
            <div className="auth-field">
              <label>Email Address</label>
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="auth-field">
              <label>Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {!isRegistering && (
              <button
                type="button"
                className="forgot-password-link"
                onClick={handleForgotPassword}
              >
                Forgot Password?
              </button>
            )}

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading
                ? isRegistering
                  ? "Creating Account..."
                  : "Signing In..."
                : isRegistering
                  ? "Create Account →"
                  : "Sign In →"}
            </button>
          </form>

          <div className="auth-toggle">
            {isRegistering ? (
              <p>
                Already have an account?{" "}
                <span
                  onClick={() => {
                    setIsRegistering(false);
                    setError("");
                    setSuccessMsg("");
                  }}
                >
                  Sign In
                </span>
              </p>
            ) : (
              <p>
                Don't have an account?{" "}
                <span
                  onClick={() => {
                    setIsRegistering(true);
                    setError("");
                    setSuccessMsg("");
                  }}
                >
                  Register
                </span>
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── LOGGED IN DASHBOARD ──
  return (
    <div className="dashboard-layout">
      <div className="dashboard-header">
        <div className="dashboard-header-title">
          <span className="account-eyebrow">McLAREN COLLECTOR PORTAL</span>
          <h1>WELCOME BACK, {(user.name || "COLLECTOR").toUpperCase()}</h1>
        </div>
        <div className="dashboard-header-actions">
          <button
            className="messages-action-btn"
            onClick={() => navigateTo("messages")}
          >
            My Messages →
          </button>
          <button className="signout-action-btn" onClick={handleLogout}>
            Sign Out →
          </button>
        </div>
      </div>

      <div className="collector-metrics-bar">
        <div className="metric-card">
          <span className="metric-label">Registered Name</span>
          <span className="metric-value">{user.name || "—"}</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Email Address</span>
          <span className="metric-value" style={{ fontSize: "0.95rem" }}>
            {user.email}
          </span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Purchase Requests</span>
          <span className="metric-value">{purchaseRequests.length}</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Account Status</span>
          <span className="metric-value status-active">Active</span>
        </div>
      </div>

      <div className="dashboard-columns">
        <div className="profile-details-column">
          <h2>COLLECTOR PROFILE</h2>
          <div className="profile-card">
            <div className="profile-avatar">
              {(user.name || user.email || "C").charAt(0).toUpperCase()}
            </div>
            <div className="profile-info-list">
              <div className="profile-info-row">
                <span>Full Name</span>
                <strong>{user.name || "—"}</strong>
              </div>
              <div className="profile-info-row">
                <span>Email</span>
                <strong>{user.email}</strong>
              </div>
              <div className="profile-info-row">
                <span>Account ID</span>
                <strong className="code-font">
                  {user.uid ? `${String(user.uid).slice(0, 12)}...` : "—"}
                </strong>
              </div>
              <div className="profile-info-row">
                <span>MSO Priority</span>
                <strong className="priority-badge">ENABLED</strong>
              </div>
            </div>

            <div className="profile-actions">
              <button
                className="profile-action-btn"
                onClick={() => navigateTo("models")}
              >
                Browse Models →
              </button>
              <button
                className="profile-action-btn outline"
                onClick={() => navigateTo("messages")}
              >
                View Messages →
              </button>
            </div>
          </div>
        </div>

        <div className="allocations-column">
          <div className="allocations-header">
            <h2>YOUR PURCHASE REQUESTS</h2>
            {purchaseRequests.length > 0 && (
              <span className="allocation-count-badge">
                {purchaseRequests.length} Request
                {purchaseRequests.length > 1 ? "s" : ""}
              </span>
            )}
          </div>

          {requestsLoading ? (
            <div className="allocations-loading">
              <div className="spinner" />
              <p>Loading your purchase requests...</p>
            </div>
          ) : purchaseRequests.length === 0 ? (
            <div className="empty-allocations-block">
              <div className="empty-icon">🏎️</div>
              <h3>No Purchase Requests Yet</h3>
              <p>
                Browse our showroom and submit a purchase request for your
                desired McLaren. Our specialists will respond within 1-3
                business days.
              </p>
              <button
                className="browse-showroom-btn"
                onClick={() => navigateTo("models")}
              >
                Explore Showroom →
              </button>
            </div>
          ) : (
            <div className="allocations-stack-list">
              {purchaseRequests.map((req) => (
                <div className="allocation-item" key={req.id}>
                  <div className="allocation-item-left">
                    <div className="allocation-meta">
                      <span className="allocation-id">
                        {req.vehicleName || req.carModel || "McLaren Vehicle"}
                      </span>
                      <span className="allocation-date">
                        {formatDate(req.submittedAt)}
                      </span>
                    </div>
                    <div className="allocation-models-list">
                      {req.exteriorColor && (
                        <div className="allocation-model-badge">
                          <span className="dot" />
                          <span>
                            Color: <strong>{req.exteriorColor}</strong>
                          </span>
                        </div>
                      )}
                      {req.deliveryRegion && (
                        <div className="allocation-model-badge">
                          <span className="dot" />
                          <span>
                            Region: <strong>{req.deliveryRegion}</strong>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="allocation-item-right">
                    <span
                      className={`allocation-status-badge ${getStatusClass(req.status)}`}
                    >
                      {req.status || "Pending Review"}
                    </span>
                    <button
                      className="view-message-btn"
                      onClick={() => navigateTo("messages")}
                    >
                      View Message →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
