import { useState } from "react";
import { db } from "../../firebase/config";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import "./Contact.css";

const SERVICES = [
  {
    number: "01",
    title: "Test Drive Experience",
    subtitle: "Feel the performance firsthand",
    description:
      "A McLaren is not understood through specification sheets. It must be felt — the immediacy of the throttle response, the precision of the steering, the way the carbon chassis communicates every surface beneath you. Our private test drive programme offers an unrushed session with a dedicated product specialist.",
    details: [
      "Private session — no group drives",
      "Full model range available",
      "Specialist on hand throughout",
      "Available at all McLaren retailers",
    ],
    image: "./cars/mclaren-1.jpg",
  },
  {
    number: "02",
    title: "MSO Bespoke",
    subtitle: "McLaren Special Operations",
    description:
      "McLaren Special Operations exists for clients who require something beyond the standard range. MSO's team of designers and craftspeople work directly with you to specify a car that is entirely your own — from paint colours mixed to match a personal reference, to hand-stitched interior trims.",
    details: [
      "Unlimited colour & material options",
      "Dedicated MSO designer assigned",
      "In-person design consultation",
      "Delivery timeline confirmed at order",
    ],
    image: "./cars/mclaren-2.jpg",
  },
  {
    number: "03",
    title: "Vehicle Servicing",
    subtitle: "Authorised McLaren maintenance",
    description:
      "Every McLaren is a precision instrument. Our authorised service centres employ factory-trained technicians who work exclusively on McLaren vehicles, using only genuine McLaren parts and proprietary diagnostic equipment.",
    details: [
      "Factory-trained technicians only",
      "Genuine McLaren parts guaranteed",
      "Courtesy vehicle provided",
      "Digital service record maintained",
    ],
    image: "./cars/mclaren-3.jpeg",
  },
  {
    number: "04",
    title: "Track Experience",
    subtitle: "Discover the true limit",
    description:
      "The road reveals approximately forty percent of what a McLaren is capable of. The circuit reveals the rest. Our track experience programme places you behind the wheel at some of the world's most celebrated circuits, guided by professional drivers.",
    details: [
      "Professional driver coaching included",
      "Selection of international circuits",
      "Full technical briefing before session",
      "In-car video analysis available",
    ],
    image: "./cars/mclaren-12.jpg",
  },
];

const SOCIALS = [
  {
    icon: "fa-brands fa-instagram",
    label: "Instagram",
    url: "https://www.instagram.com/mclarenautomotive",
    cls: "ct-social-instagram",
  },
  {
    icon: "fa-brands fa-youtube",
    label: "YouTube",
    url: "https://www.youtube.com/user/McLarenAutomotiveTV",
    cls: "ct-social-youtube",
  },
  {
    icon: "fa-brands fa-facebook",
    label: "Facebook",
    url: "https://www.facebook.com/McLarenAutomotive",
    cls: "ct-social-facebook",
  },
  {
    icon: "fa-brands fa-linkedin",
    label: "LinkedIn",
    url: "https://www.linkedin.com/company/mclaren",
    cls: "ct-social-linkedin",
  },
];

export default function Contact() {
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

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await addDoc(collection(db, "contact_inquiries"), {
        ...form,
        submittedAt: serverTimestamp(),
      });
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const scrollToForm = () => {
    document
      .querySelector(".ct-form-side")
      ?.scrollIntoView({ behavior: "smooth" });
  };

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
            <div className="ct-info-block">
              <span className="ct-section-label">VISIT US</span>
              <h3>McLaren Production Centre</h3>
              <p>
                Chertsey Road, Woking
                <br />
                Surrey, GU21 4YH
                <br />
                United Kingdom
              </p>
            </div>
            <div className="ct-info-block">
              <span className="ct-section-label">OPENING HOURS</span>
              <div className="ct-hours">
                <div className="ct-hours-row">
                  <span>Monday — Friday</span>
                  <span>9:00 AM — 6:00 PM</span>
                </div>
                <div className="ct-hours-row">
                  <span>Saturday</span>
                  <span>10:00 AM — 4:00 PM</span>
                </div>
                <div className="ct-hours-row">
                  <span>Sunday</span>
                  <span>Closed</span>
                </div>
              </div>
            </div>
            <div className="ct-info-block">
              <span className="ct-section-label">DIRECT CONTACT</span>
              <div className="ct-contact-links">
                <a href="tel:+441483261900">+44 (0) 1483 261900</a>
                <a href="mailto:sales@mclaren.com">sales@mclaren.com</a>
              </div>
            </div>
            <div className="ct-info-block">
              <span className="ct-section-label">FOLLOW US</span>
              <div className="ct-socials">
                {SOCIALS.map((s) => (
                  <a
                    key={s.label}
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={s.label}
                    className={`ct-social-icon ${s.cls}`}
                  >
                    <i className={s.icon}></i>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES — EDITORIAL STYLE */}
      <section className="ct-services-section">
        <div className="ct-services-intro">
          <span className="ct-section-label">WHAT WE OFFER</span>
          <h2>Our Services</h2>
          <p>
            Every McLaren ownership journey is supported by a suite of
            world-class services — designed around you, not around convenience.
          </p>
        </div>

        <div className="ct-services-list">
          {SERVICES.map((service, idx) => (
            <div
              className={`ct-service-row ${
                idx % 2 !== 0 ? "ct-service-row--reverse" : ""
              }`}
              key={service.number}
            >
              {/* IMAGE */}
              <div className="ct-service-media">
                <img src={service.image} alt={service.title} loading="lazy" />
                <span className="ct-service-num">{service.number}</span>
              </div>

              {/* TEXT */}
              <div className="ct-service-text">
                <span className="ct-section-label">{service.subtitle}</span>
                <h3>{service.title}</h3>
                <p className="ct-service-desc">{service.description}</p>
                <ul className="ct-service-details">
                  {service.details.map((d) => (
                    <li key={d}>
                      <span className="ct-detail-icon">✓</span>
                      {d}
                    </li>
                  ))}
                </ul>
                <button className="ct-enquire-btn" onClick={scrollToForm}>
                  Enquire About This Service →
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
