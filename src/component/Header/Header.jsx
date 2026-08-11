import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInbox } from "@fortawesome/free-solid-svg-icons";
import "./Header.css";

export default function Header({ currentPage, navigateTo, user }) {
  return (
    <header className="brand-header">
      <div className="header-inner">
        {/* Logo */}
        <div className="brand-logo" onClick={() => navigateTo("home")}>
          MCLAREN <span className="logo-accent">SHOWROOM</span>
        </div>

        {/* Main Nav: Home | Models | About | Contact */}
        <ul className="header-nav">
          <li
            className={currentPage === "home" ? "active" : ""}
            onClick={() => navigateTo("home")}
          >
            Home
          </li>
          <li
            className={currentPage === "models" ? "active" : ""}
            onClick={() => navigateTo("models")}
          >
            Models
          </li>
          <li
            className={currentPage === "about" ? "active" : ""}
            onClick={() => navigateTo("about")}
          >
            About
          </li>
          <li
            className={currentPage === "contact" ? "active" : ""}
            onClick={() => navigateTo("contact")}
          >
            Contact
          </li>
        </ul>

        {/* Right Actions */}
        <div className="header-actions">
          {user.isLoggedIn ? (
            // Logged in: Account + Inbox
            <>
              <button
                className="nav-action-btn"
                onClick={() => navigateTo("account")}
              >
                Account
              </button>
              <button
                className="nav-action-btn inbox-btn"
                onClick={() => navigateTo("messages")}
              >
                <FontAwesomeIcon icon={faInbox} />
              </button>
            </>
          ) : (
            // Not logged in: Log In + Sign Up
            <>
              <button
                className="nav-action-btn"
                onClick={() => navigateTo("login")}
              >
                Log In
              </button>
              <button
                className="nav-action-btn signup-btn"
                onClick={() => navigateTo("signup")}
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
