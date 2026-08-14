import { useState } from "react";
import "./Login.css";

const API_BASE = "http://localhost:3000/api";

function SignUp({ navigateTo, setUser }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Sign up failed. Please try again.");
        return;
      }

      localStorage.setItem("token", data.token);

      if (setUser) {
        setUser({
          isLoggedIn: true,
          uid: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role || "client",
        });
      }

      navigateTo("home");
    } catch {
      setError("Sign up failed. Could not reach the server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="auth-section">
      {/* Sleek Top-Right Exit Button */}
      <button
        type="button"
        className="auth-screen-exit"
        onClick={() => navigateTo("home")}
        aria-label="Close and return home"
      >
        <span>Close</span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>

      <div className="auth-card">
        <span className="auth-eyebrow">Join McLaren</span>
        <h1 className="header">Sign Up</h1>
        <p className="auth-subtext">
          Sign up to save your favorite models and track your allocations.
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <p className="auth-error">{error}</p>}

          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              type="text"
              placeholder="Bruce McLaren"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account?{" "}
          <button
            type="button"
            className="auth-switch-link"
            onClick={() => navigateTo("login")}
          >
            Log In
          </button>
        </p>
      </div>
    </section>
  );
}

export default SignUp;
