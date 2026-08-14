import { useState, useEffect } from "react";

// Layout Components
import Header from "./component/Header/Header";
import Footer from "./component/Footer/Footer";

// Pages & Views
import Home from "./pages/Home/Home";
import Models from "./pages/Models/Models";
import VehicleDetails from "./pages/VehicleDetails/VehicleDetails";
import About from "./pages/About/About";
import Contact from "./pages/Contact/Contact";
import Account from "./component/Account/Account";
import Messages from "./pages/Messages/Messages";
import Login from "./pages/Login/Login";
import SignUp from "./pages/Login/SignUp";
import ForgotPassword from "./component/Account/ForgotPassword";
import AdminDashboard from "./component/Admin/AdminDashBoard"; // ✅ Fixed casing

import "./App.css";

const API_BASE = "http://localhost:3000/api";

function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);
  const [user, setUser] = useState({
    isLoggedIn: false,
    uid: null,
    name: "",
    email: "",
    role: "client",
  });
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    async function restoreSession() {
      const token = localStorage.getItem("token");
      if (!token) {
        setAuthChecked(true);
        return;
      }
      try {
        const res = await fetch(`${API_BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setUser({
            isLoggedIn: true,
            uid: data.user.id,
            name: data.user.name,
            email: data.user.email,
            role: data.user.role || "client",
          });
        } else {
          localStorage.removeItem("token");
        }
      } catch (err) {
        console.warn("Could not restore session:", err.message);
      } finally {
        setAuthChecked(true);
      }
    }
    restoreSession();
  }, []);

  const navigateTo = (page, vehicleId = null) => {
    setCurrentPage(page);
    if (vehicleId) setSelectedVehicleId(vehicleId);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const hideFooterPages = ["login", "signup", "forgot-password", "admin"];

  if (!authChecked) return null;

  const isAdmin =
    user.isLoggedIn &&
    (user.role === "admin" ||
      user.email === "ronalheng832@gmail.com" ||
      user.email === "admin@mclaren.com");

  return (
    <div className="app-frame">
      <Header currentPage={currentPage} navigateTo={navigateTo} user={user} />

      <main className="view-window">
        {currentPage === "home" && <Home navigateTo={navigateTo} />}
        {currentPage === "models" && <Models navigateTo={navigateTo} />}
        {currentPage === "vehicle-details" && (
          <VehicleDetails carId={selectedVehicleId} navigateTo={navigateTo} />
        )}
        {currentPage === "about" && <About navigateTo={navigateTo} />}
        {currentPage === "contact" && <Contact navigateTo={navigateTo} />}
        {currentPage === "login" && (
          <Login navigateTo={navigateTo} setUser={setUser} />
        )}
        {currentPage === "signup" && (
          <SignUp navigateTo={navigateTo} setUser={setUser} />
        )}
        {currentPage === "forgot-password" && (
          <ForgotPassword onBackToLogin={() => navigateTo("login")} />
        )}
        {currentPage === "account" && (
          <Account user={user} setUser={setUser} navigateTo={navigateTo} />
        )}
        {currentPage === "messages" && (
          <Messages user={user} navigateTo={navigateTo} />
        )}
        {currentPage === "admin" &&
          (isAdmin ? (
            <AdminDashboard navigateTo={navigateTo} />
          ) : (
            <div
              style={{
                padding: "8rem 2rem",
                textAlign: "center",
                color: "#f7f6f3",
                minHeight: "60vh",
              }}
            >
              <h2 style={{ fontSize: "2rem", marginBottom: "1rem" }}>
                🔒 Access Denied
              </h2>
              <p style={{ color: "#8c8c88" }}>
                Logged in as: <strong>{user.email || "Guest"}</strong> (Role:{" "}
                {user.role || "client"})
              </p>
              <p style={{ color: "#8c8c88", marginTop: "0.5rem" }}>
                You need <code>"role": "admin"</code> in{" "}
                <code>data/users.json</code> to view this panel.
              </p>
              <button
                style={{
                  marginTop: "1.5rem",
                  padding: "10px 20px",
                  cursor: "pointer",
                  background: "#fff",
                  color: "#000",
                  border: "none",
                  fontWeight: "bold",
                }}
                onClick={() => navigateTo("home")}
              >
                Return Home
              </button>
            </div>
          ))}
      </main>

      {!hideFooterPages.includes(currentPage) && (
        <Footer navigateTo={navigateTo} isAdmin={isAdmin} />
      )}
    </div>
  );
}

export default App;
