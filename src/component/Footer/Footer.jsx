import "./Footer.css";

export default function Footer({ navigateTo, isAdmin }) {
  const FOOTER_COLUMNS = [
    {
      title: "Explore",
      links: [
        { label: "Home", target: "home" },
        { label: "Models", target: "models" },
        { label: "About", target: "about" },
        { label: "Contact", target: "contact" },
      ],
    },
    {
      title: "Models",
      links: [
        { label: "720S Spider", target: "models" },
        { label: "Artura", target: "models" },
        { label: "750S Spider", target: "models" },
        { label: "W1 Hypercar", target: "models" },
      ],
    },
    {
      title: "Account",
      links: [
        { label: "Log In", target: "login" },
        { label: "Sign Up", target: "signup" },
        { label: "My Account", target: "account" },
        { label: "My Messages", target: "messages" },
      ],
    },
  ];

  return (
    <footer className="site-footer">
      <div className="footer-columns">
        {FOOTER_COLUMNS.map((col) => (
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

        {/* Only visible to admin users */}
        {isAdmin && (
          <span onClick={() => navigateTo("admin")} className="footer-link">
            Admin Control Panel
          </span>
        )}
      </div>
    </footer>
  );
}
