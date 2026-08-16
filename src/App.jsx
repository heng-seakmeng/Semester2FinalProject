import { useState, useEffect } from "react";
// import { api } from "./api/client";

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
import AdminDashboard from "./component/Admin/AdminDashboard";

import "./App.css";

function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);
  const [user, setUser] = useState({
    isLoggedIn: false,
    uid: null,
    name: "",
    email: "",
  });
  const [authChecked, setAuthChecked] = useState(false);

  // Restore session from a stored token on first load
  useEffect(() => {
    async function restoreSession() {
      const token = localStorage.getItem("token");
      if (!token) {
        setAuthChecked(true);
        return;
      }
      try {
        const me = await api.me();
        setUser({
          isLoggedIn: true,
          uid: me.uid,
          name: me.name,
          email: me.email,
        });
      } catch {
        // Token invalid or expired
        localStorage.removeItem("token");
        setUser({ isLoggedIn: false, uid: null, name: "", email: "" });
      } finally {
        setAuthChecked(true);
      }
    }
    restoreSession();
  }, []);

  const navigateTo = (page, vehicleId = null) => {
    setCurrentPage(page);
    if (vehicleId) {
      setSelectedVehicleId(vehicleId);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const hideFooterPages = ["login", "signup", "forgot-password", "admin"];

  // Wait for the session check before rendering, so the header doesn't
  // flash "Log In" then immediately swap to "Account"
  if (!authChecked) {
    return null; // or a loading spinner if you have one
  }

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

        {currentPage === "admin" && <AdminDashboard navigateTo={navigateTo} />}
      </main>

      {!hideFooterPages.includes(currentPage) && (
        <Footer navigateTo={navigateTo} />
      )}
    </div>
  );
}

export default App;
