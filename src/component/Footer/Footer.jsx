import { useState, useEffect } from "react";
import "./Footer.css";

const API_BASE = `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api`;

export default function Footer({ navigateTo, isAdmin }) {
  const [footerColumns, setFooterColumns] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE}/footer`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setFooterColumns(data);
      })
      .catch((err) => console.error("Error loading footer data:", err));
  }, []);

  return (
    <footer className="site-footer">
      <div className="footer-columns">
        {footerColumns.map((col) => (
          <div className="footer-column" key={col.title}>
            <h4>{col.title}</h4>
            <ul>
              {col.links.map((link) => (
                <li key={link.label}>
                  <button onClick={() => navigateTo(link.target)}>
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="footer-bottom">
        <span className="footer-copyright">
          © {new Date().getFullYear()} McLaren Automotive. All rights reserved.
        </span>

        {isAdmin && (
          <span onClick={() => navigateTo("admin")} className="footer-link">
            Admin Control Panel
          </span>
        )}
      </div>
    </footer>
  );
}
