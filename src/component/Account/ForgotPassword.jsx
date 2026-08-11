import { useState } from "react";
import { auth } from "../../firebase/config";
import { sendPasswordResetEmail } from "firebase/auth";
import "./ForgotPassword.css";

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
      await sendPasswordResetEmail(auth, email);
      setMessage("A password reset link has been sent to your email address.");
      setEmail("");
    } catch (err) {
      if (err.code === "auth/user-not-found") {
        setError("No account registered with this email.");
      } else if (err.code === "auth/invalid-email") {
        setError("Invalid email address format.");
      } else {
        setError("Failed to send reset email. Please try again.");
      }
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
