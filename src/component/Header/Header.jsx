import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInbox, faBars, faTimes } from "@fortawesome/free-solid-svg-icons";
import "./Header.css";

export default function Header({ currentPage, navigateTo, user }) {
  const [menuOpen, setMenuOpen] = useState(false);

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [menuOpen]);

  const handleNav = (page) => {
    navigateTo(page);
    setMenuOpen(false);
  };

  return (
    <header className="brand-header">
      <div className="header-inner">
        {/* Logo */}
        <div className="brand-logo" onClick={() => handleNav("home")}>
          <img src="./images/Character/mclaren-logo.svg" alt="McLaren" />
        </div>

        {/* Main Nav: Home | Models | About | Contact */}
        <ul className="header-nav">
          <li
            className={currentPage === "home" ? "active" : ""}
            onClick={() => handleNav("home")}
          >
            Home
          </li>
          <li
            className={currentPage === "models" ? "active" : ""}
            onClick={() => handleNav("models")}
          >
            Models
          </li>
          <li
            className={currentPage === "about" ? "active" : ""}
            onClick={() => handleNav("about")}
          >
            About
          </li>
          <li
            className={currentPage === "contact" ? "active" : ""}
            onClick={() => handleNav("contact")}
          >
            Contact
          </li>
        </ul>

        {/* Right Actions */}
        <div className="header-actions">
          {user.isLoggedIn ? (
            // Logged in: Admin (if applicable) + Account + Inbox
            <>
              {user.role === "admin" && (
                <button
                  className="nav-action-btn"
                  onClick={() => handleNav("admin")}
                >
                  Admin
                </button>
              )}
              <button
                className="nav-action-btn"
                onClick={() => handleNav("account")}
              >
                Account
              </button>
              <button
                className="nav-action-btn inbox-btn"
                onClick={() => handleNav("messages")}
              >
                <FontAwesomeIcon icon={faInbox} />
              </button>
            </>
          ) : (
            // Not logged in: Log In + Sign Up
            <>
              <button
                className="nav-action-btn"
                onClick={() => handleNav("login")}
              >
                Log In
              </button>
              <button
                className="nav-action-btn signup-btn"
                onClick={() => handleNav("signup")}
              >
                Sign Up
              </button>
            </>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            className="mobile-menu-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle Menu"
          >
            <FontAwesomeIcon icon={menuOpen ? faTimes : faBars} />
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer Overlay */}
      <div className={`mobile-menu-drawer ${menuOpen ? "open" : ""}`}>
        <ul className="mobile-nav-list">
          <li
            className={currentPage === "home" ? "active" : ""}
            onClick={() => handleNav("home")}
          >
            Home
          </li>
          <li
            className={currentPage === "models" ? "active" : ""}
            onClick={() => handleNav("models")}
          >
            Models
          </li>
          <li
            className={currentPage === "about" ? "active" : ""}
            onClick={() => handleNav("about")}
          >
            About
          </li>
          <li
            className={currentPage === "contact" ? "active" : ""}
            onClick={() => handleNav("contact")}
          >
            Contact
          </li>
        </ul>

        <div className="mobile-actions-divider"></div>

        <div className="mobile-actions-list">
          {user.isLoggedIn ? (
            <>
              {user.role === "admin" && (
                <button
                  className="nav-action-btn"
                  onClick={() => handleNav("admin")}
                >
                  Admin
                </button>
              )}
              <button
                className="nav-action-btn"
                onClick={() => handleNav("account")}
              >
                Account
              </button>
              <button
                className="nav-action-btn"
                onClick={() => handleNav("messages")}
              >
                Inbox{" "}
                <FontAwesomeIcon icon={faInbox} style={{ marginLeft: "6px" }} />
              </button>
            </>
          ) : (
            <>
              <button
                className="nav-action-btn"
                onClick={() => handleNav("login")}
              >
                Log In
              </button>
              <button
                className="nav-action-btn signup-btn"
                onClick={() => handleNav("signup")}
              >
                Sign Up
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
