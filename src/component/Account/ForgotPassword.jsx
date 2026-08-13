import { useState } from "react";
import "./ForgotPassword.css";

const API_BASE = "http://localhost:3000/api";

export default function ForgotPassword({ onBackToLogin }) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to send reset email. Please try again.");
        return;
      }

      setMessage(
        "If an account exists with that email, a reset link has been sent.",
      );
      setEmail("");
    } catch {
      setError("Could not reach the server. Is it running on port 3000?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-view-container">
      <div className="auth-box">
        <span className="auth-eyebrow">SECURITY ASSISTANCE</span>
        <h2>RESET PASSWORD</h2>
        <p className="auth-subtext">
          Enter your registered email address and we will send you a link to
          reset your access credentials.
        </p>

        {message && <p className="auth-success">{message}</p>}
        {error && <p className="auth-error">{error}</p>}

        <form onSubmit={handleResetPassword} className="auth-styled-form">
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

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? "Sending Link..." : "Send Reset Link →"}
          </button>
        </form>

        <div className="auth-toggle">
          <p>
            Remembered your credentials?{" "}
            <span onClick={onBackToLogin}>Back to Sign In</span>
          </p>
        </div>
      </div>
    </div>
  );
}
