import { useState } from "react";
import "./Login.css";

const API_BASE = "http://localhost:3000/api";

function Login({ navigateTo, setUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed. Please try again.");
        return;
      }

      // Save token consistently as "token"
      localStorage.setItem("token", data.token);

      // Update user state inside handleSubmit where 'data' exists
      if (setUser) {
        setUser({
          isLoggedIn: true,
          uid: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role || "client", // Role properly saved
        });
      }

      navigateTo("home");
    } catch {
      setError("Could not reach the server. Is it running on port 3000?");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="auth-section">
      <div className="auth-card">
        <p className="auth-eyebrow">Welcome Back</p>
        <h1 className="header">Log In To Account</h1>
        <p className="auth-subtext">
          Access your saved models, orders, and preferences.
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <p className="auth-error">{error}</p>}

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
            />
          </div>

          <div className="auth-row">
            <label className="remember-me">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              Remember Me
            </label>

            <button
              type="button"
              className="forgot-link"
              onClick={() => navigateTo("forgot-password")}
            >
              Forgot Password?
            </button>
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? "Logging In..." : "Login"}
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account?{" "}
          <button
            type="button"
            className="auth-switch-link"
            onClick={() => navigateTo("signup")}
          >
            Sign Up
          </button>
        </p>
      </div>
    </section>
  );
}

export default Login;
