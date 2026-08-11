import { useState, useEffect } from "react";
import { auth, db } from "./firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, doc, setDoc } from "firebase/firestore";
import { vehicles as seedData } from "./data/vehicles";

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
import SignUp from "./pages/Login/SignUp"; // Fixed import spelling (SignUp)
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

  // 1. Sync User Session with Firebase Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          isLoggedIn: true,
          uid: firebaseUser.uid,
          name: firebaseUser.displayName || "Preferred Collector",
          email: firebaseUser.email,
        });
      } else {
        setUser({ isLoggedIn: false, uid: null, name: "", email: "" });
      }
    });
    return () => unsubscribe();
  }, []);

  // 2. Automated Firestore Seeder
  useEffect(() => {
    async function seedDatabase() {
      try {
        const querySnapshot = await getDocs(collection(db, "vehicles"));
        if (querySnapshot.empty) {
          console.log("Firestore empty. Seeding vehicles...");
          for (const car of seedData) {
            await setDoc(doc(db, "vehicles", car.id), car);
          }
          console.log("Database successfully seeded.");
        }
      } catch (err) {
        console.warn("Database seeder run note: ", err.message);
      }
    }
    seedDatabase();
  }, []);

  // Page Navigation Handler
  const navigateTo = (page, vehicleId = null) => {
    setCurrentPage(page);
    if (vehicleId) {
      setSelectedVehicleId(vehicleId);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Pages where Footer should be hidden
  const hideFooterPages = ["login", "signup", "forgot-password", "admin"];

  return (
    <div className="app-frame">
      {/* Header stays visible across the application */}
      <Header currentPage={currentPage} navigateTo={navigateTo} user={user} />

      <main className="view-window">
        {currentPage === "home" && <Home navigateTo={navigateTo} />}

        {currentPage === "models" && <Models navigateTo={navigateTo} />}

        {currentPage === "vehicle-details" && (
          <VehicleDetails carId={selectedVehicleId} navigateTo={navigateTo} />
        )}

        {currentPage === "about" && <About navigateTo={navigateTo} />}

        {currentPage === "contact" && <Contact navigateTo={navigateTo} />}

        {currentPage === "login" && <Login navigateTo={navigateTo} />}

        {currentPage === "signup" && <SignUp navigateTo={navigateTo} />}

        {currentPage === "forgot-password" && (
          <ForgotPassword onBackToLogin={() => navigateTo("login")} />
        )}

        {currentPage === "account" && (
          <Account user={user} navigateTo={navigateTo} />
        )}
        {currentPage === "messages" && (
          <Messages user={user} navigateTo={navigateTo} />
        )}

        {currentPage === "admin" && <AdminDashboard navigateTo={navigateTo} />}
      </main>

      {/* Footer appears on standard content pages */}
      {!hideFooterPages.includes(currentPage) && (
        <Footer navigateTo={navigateTo} />
      )}
    </div>
  );
}

export default App;
