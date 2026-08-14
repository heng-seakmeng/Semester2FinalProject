import { useState, useEffect } from "react";
import "./Contact.css";

export default function Contact() {
  const [pageData, setPageData] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    subject: "General Inquiry",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function fetchContactData() {
      try {
        const res = await fetch("http://localhost:3000/api/contact");
        if (!res.ok) throw new Error("Failed to load contact data");
        const data = await res.json();
        if (mounted) {
          setPageData(data);
        }
      } catch (err) {
        console.error("Error loading contact data:", err);
      } finally {
        if (mounted) {
          setPageLoading(false);
        }
      }
    }

    fetchContactData();

    return () => {
      mounted = false;
    };
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // Map service titles to dropdown subjects
  const handleServiceEnquire = (serviceTitle) => {
    let matchedSubject = "General Inquiry";
    if (serviceTitle.toLowerCase().includes("test drive")) {
      matchedSubject = "Test Drive Request";
    } else if (serviceTitle.toLowerCase().includes("servicing")) {
      matchedSubject = "Servicing & Maintenance";
    } else if (serviceTitle.toLowerCase().includes("mso")) {
      matchedSubject = "Purchase Inquiry";
    }

    setForm((prev) => ({ ...prev, subject: matchedSubject }));

    document
      .querySelector(".ct-form-side")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:3000/api/contact/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to submit inquiry");
      }

      setSubmitted(true);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div
        className="contact-loading"
        style={{
          minHeight: "80vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#8c8c88",
        }}
      >
        <span>LOADING CONTACT CENTRE...</span>
      </div>
    );
  }

  const services = pageData?.services || [];
  const socials = pageData?.socials || [];
  const info = pageData?.info || {};

  return (
    <div className="contact-page">
      {/* HERO */}
      <section className="ct-hero">
        <div className="ct-hero-bg" />
        <div className="ct-hero-content">
          <span className="ct-eyebrow">GET IN TOUCH</span>
          <h1>
            We'd love to
            <br />
            <em>hear from you.</em>
          </h1>
        </div>
      </section>

      {/* CONTACT GRID */}
      <section className="ct-main-section">
        <div className="ct-main-grid">
          {/* FORM */}
          <div className="ct-form-side">
            <span className="ct-section-label">SEND A MESSAGE</span>
            <h2>Start the conversation.</h2>
            {submitted ? (
              <div className="ct-success">
                <span className="ct-success-icon">✓</span>
                <h3>Message Received</h3>
                <p>
                  A McLaren specialist will contact you within one business day.
                </p>
                <button
                  className="ct-submit-btn"
                  onClick={() => {
                    setSubmitted(false);
                    setForm({
                      fullName: "",
                      email: "",
                      phone: "",
                      subject: "General Inquiry",
                      message: "",
                    });
                  }}
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form className="ct-form" onSubmit={handleSubmit}>
                <div className="ct-form-row">
                  <div className="ct-field">
                    <label>Full Name *</label>
                    <input
                      type="text"
                      name="fullName"
                      value={form.fullName}
                      onChange={handleChange}
                      placeholder="James W."
                      required
                    />
                  </div>
                  <div className="ct-field">
                    <label>Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                </div>
                <div className="ct-form-row">
                  <div className="ct-field">
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="+1 234 567 8900"
                    />
                  </div>
                  <div className="ct-field">
                    <label>Subject *</label>
                    <select
                      name="subject"
                      value={form.subject}
                      onChange={handleChange}
                    >
                      <option>General Inquiry</option>
                      <option>Purchase Inquiry</option>
                      <option>Test Drive Request</option>
                      <option>Servicing & Maintenance</option>
                      <option>Press & Media</option>
                    </select>
                  </div>
                </div>
                <div className="ct-field">
                  <label>Message *</label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    rows={6}
                    placeholder="Tell us how we can help..."
                    required
                  />
                </div>
                {error && <p className="ct-error">{error}</p>}
                <button
                  type="submit"
                  className="ct-submit-btn"
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Send Message →"}
                </button>
              </form>
            )}
          </div>

          {/* INFO */}
          <div className="ct-info-side">
            {info.address && (
              <div className="ct-info-block">
                <span className="ct-section-label">VISIT US</span>
                <h3>{info.address.title}</h3>
                <p>
                  {info.address.lines?.map((line, idx) => (
                    <span key={idx}>
                      {line}
                      <br />
                    </span>
                  ))}
                </p>
              </div>
            )}

            {info.hours && (
              <div className="ct-info-block">
                <span className="ct-section-label">OPENING HOURS</span>
                <div className="ct-hours">
                  {info.hours.map((h, idx) => (
                    <div className="ct-hours-row" key={idx}>
                      <span>{h.day}</span>
                      <span>{h.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {info.contact && (
              <div className="ct-info-block">
                <span className="ct-section-label">DIRECT CONTACT</span>
                <div className="ct-contact-links">
                  <a href={`tel:${info.contact.phoneRaw}`}>
                    {info.contact.phone}
                  </a>
                  <a href={`mailto:${info.contact.email}`}>
                    {info.contact.email}
                  </a>
                </div>
              </div>
            )}

            {socials.length > 0 && (
              <div className="ct-info-block">
                <span className="ct-section-label">FOLLOW US</span>
                <div className="ct-socials">
                  {socials.map((s) => (
                    <a
                      key={s.label}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.label}
                      className={`ct-social-icon ${s.cls}`}
                    >
                      <i className={s.icon}></i>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* SERVICES */}
      {services.length > 0 && (
        <section className="ct-services-section">
          <div className="ct-services-intro">
            <span className="ct-section-label">WHAT WE OFFER</span>
            <h2>Our Services</h2>
            <p>
              Every McLaren ownership journey is supported by a suite of
              world-class services — designed around you, not around
              convenience.
            </p>
          </div>

          <div className="ct-services-list">
            {services.map((service, idx) => (
              <div
                className={`ct-service-row ${
                  idx % 2 !== 0 ? "ct-service-row--reverse" : ""
                }`}
                key={service.number || idx}
              >
                <div className="ct-service-media">
                  <img src={service.image} alt={service.title} loading="lazy" />
                  <span className="ct-service-num">{service.number}</span>
                </div>

                <div className="ct-service-text">
                  <span className="ct-section-label">{service.subtitle}</span>
                  <h3>{service.title}</h3>
                  <p className="ct-service-desc">{service.description}</p>
                  <ul className="ct-service-details">
                    {service.details?.map((d) => (
                      <li key={d}>
                        <span className="ct-detail-icon">✓</span>
                        {d}
                      </li>
                    ))}
                  </ul>
                  <button
                    className="ct-enquire-btn"
                    onClick={() => handleServiceEnquire(service.title)}
                  >
                    Enquire About This Service →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
