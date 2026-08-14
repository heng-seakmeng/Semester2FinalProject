import { useState, useEffect } from "react";
import "./VehicleDetails.css";

export default function VehicleDetails({ carId, navigateTo }) {
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("overview");

  // Purchase Request Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [deliveryRegion, setDeliveryRegion] = useState("North America");
  const [exteriorColor, setExteriorColor] = useState("Signature Papaya Spark");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Lock background scroll when modal is open
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isModalOpen]);

  useEffect(() => {
    let mounted = true;

    async function loadVehicle() {
      setLoading(true);

      try {
        const idToFetch = carId || "mclaren-750s";
        const res = await fetch(
          `http://localhost:3000/api/vehicles/${idToFetch}`,
        );

        if (res.ok) {
          const data = await res.json();
          if (mounted) {
            setVehicle(data);
            setLoading(false);
            return;
          }
        } else {
          // Fallback to default vehicle if requested ID is not found
          const fallbackRes = await fetch(
            "http://localhost:3000/api/vehicles/mclaren-750s",
          );
          if (fallbackRes.ok && mounted) {
            const fallbackData = await fallbackRes.json();
            setVehicle(fallbackData);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.error(
          "Error fetching vehicle details from Express backend:",
          err,
        );
      }

      if (mounted) {
        setLoading(false);
      }
    }

    loadVehicle();
    window.scrollTo({ top: 0, behavior: "smooth" });

    return () => {
      mounted = false;
    };
  }, [carId]);

  const scrollToSection = (sectionId) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handlePurchaseSubmit = async (e) => {
    e.preventDefault();
    if (!agreedToTerms) return;

    try {
      const response = await fetch(
        "http://localhost:3000/api/purchase-requests",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clientName,
            clientEmail,
            vehicleName: vehicle?.name,
            carModel: vehicle?.id,
            deliveryRegion,
            exteriorColor,
            additionalNotes,
            status: "Pending Review",
          }),
        },
      );

      if (response.ok) {
        setSubmitted(true);
      } else {
        alert("Failed to submit purchase request.");
      }
    } catch (err) {
      console.error("Error saving purchase request:", err);
      alert("Error connecting to http://localhost:3000");
    }
  };

  const resetModal = () => {
    setSubmitted(false);
    setIsModalOpen(false);
    setClientName("");
    setClientEmail("");
    setDeliveryRegion("North America");
    setExteriorColor("Signature Papaya Spark");
    setAdditionalNotes("");
    setAgreedToTerms(false);
  };

  if (loading || !vehicle) {
    return (
      <div className="details-loading">
        <div className="details-spinner" aria-hidden="true" />
        <span>LOADING McLAREN SPECIFICATIONS...</span>
      </div>
    );
  }

  const heroImg =
    vehicle?.images?.hero || vehicle?.images?.exterior || vehicle?.image;
  const p = vehicle?.performance || {};

  return (
    <div className="arch-editorial-page">
      {/* Editorial Hero Header */}
      <section
        className="arch-hero"
        style={{ backgroundImage: `url(${heroImg})` }}
      >
        <div className="arch-hero-tint" />
        <div className="arch-hero-text">
          <span className="brand-prefix">{vehicle.brand || "McLaren"}</span>
          <h1 className="hero-car-title">{vehicle.name}</h1>
        </div>
      </section>

      {/* Sticky Subnav Bar */}
      <nav className="arch-subnav">
        <div className="subnav-container">
          <div className="subnav-links">
            <button
              className={`subnav-link ${activeSection === "overview" ? "active" : ""}`}
              onClick={() => scrollToSection("overview")}
            >
              OVERVIEW
            </button>
            <button
              className={`subnav-link ${activeSection === "lightness" ? "active" : ""}`}
              onClick={() => scrollToSection("lightness")}
            >
              LIGHTNESS
            </button>
            <button
              className={`subnav-link ${activeSection === "engagement" ? "active" : ""}`}
              onClick={() => scrollToSection("engagement")}
            >
              ENGAGEMENT
            </button>
            <button
              className={`subnav-link ${activeSection === "power" ? "active" : ""}`}
              onClick={() => scrollToSection("power")}
            >
              POWER
            </button>
            <button
              className={`subnav-link ${activeSection === "specification" ? "active" : ""}`}
              onClick={() => scrollToSection("specification")}
            >
              SPECIFICATION
            </button>
          </div>

          <button
            className="single-purchase-btn"
            onClick={() => setIsModalOpen(true)}
          >
            PURCHASE REQUEST →
          </button>
        </div>
      </nav>

      {/* Main Editorial Body */}
      <div className="arch-editorial-body">
        {/* SECTION 01 / OVERVIEW */}
        <section className="arch-section" id="overview">
          <div className="section-split">
            <div className="text-col">
              <span className="section-num">01 / OVERVIEW</span>
              <h2 className="section-title">
                {vehicle.overviewHeadline || "BENCHMARK SUPERCAR PERFORMANCE"}
              </h2>
              <p className="body-text">
                {vehicle.overviewText || vehicle.summary}
              </p>
              <div className="metric-row">
                <div className="metric-unit">
                  <span className="metric-val">{p.horsepower || "750 PS"}</span>
                  <span className="metric-lbl">Power</span>
                </div>
                <div className="metric-unit">
                  <span className="metric-val">{p.topSpeed || "332 km/h"}</span>
                  <span className="metric-lbl">Top Speed</span>
                </div>
              </div>
            </div>
            <div className="media-col">
              <div className="widescreen-frame">
                <img
                  src={vehicle?.images?.overview || heroImg}
                  alt={vehicle.name}
                />
                <span className="media-badge">OVERVIEW</span>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 02 / LIGHTNESS */}
        <section className="arch-section" id="lightness">
          <div className="section-split">
            <div className="text-col">
              <span className="section-num">02 / LIGHTNESS</span>
              <h2 className="section-title">
                {vehicle.lightnessHeadline || "LIGHTWEIGHT COMPOSITE PURSUIT"}
              </h2>
              <p className="body-text">
                {vehicle.lightnessText ||
                  "Derived from Formula 1 composite technology, providing immense structural rigidity and lightweight agility."}
              </p>
              {p.weight && (
                <div className="metric-row">
                  <div className="metric-unit">
                    <span className="metric-val">{p.weight}</span>
                    <span className="metric-lbl">Dry Weight</span>
                  </div>
                </div>
              )}
            </div>
            <div className="media-col">
              <div className="widescreen-frame">
                <img
                  src={vehicle?.images?.lightness || heroImg}
                  alt="Lightness"
                />
                <span className="media-badge">LIGHTWEIGHT</span>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 03 / ENGAGEMENT */}
        <section className="arch-section" id="engagement">
          <div className="section-split">
            <div className="text-col">
              <span className="section-num">03 / ENGAGEMENT</span>
              <h2 className="section-title">
                {vehicle.engagementHeadline ||
                  "SURGICAL STEERING & CHASSIS CONTROL"}
              </h2>
              <p className="body-text">
                {vehicle.engagementText ||
                  "Features electro-hydraulic steering feedback, adaptive dampers, and precision suspension geometry."}
              </p>
              {p.chassis && (
                <div className="metric-row">
                  <div className="metric-unit">
                    <span className="metric-val">{p.chassis}</span>
                    <span className="metric-lbl">Chassis Architecture</span>
                  </div>
                </div>
              )}
            </div>
            <div className="media-col">
              <div className="widescreen-frame">
                <img
                  src={vehicle?.images?.engagement || heroImg}
                  alt="Engagement"
                />
                <span className="media-badge">DYNAMICS</span>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 04 / POWER */}
        <section className="arch-section" id="power">
          <div className="section-split">
            <div className="text-col">
              <span className="section-num">04 / POWER</span>
              <h2 className="section-title">
                {vehicle.powerHeadline || "TWIN-TURBOCHARGED POWERTRAIN"}
              </h2>
              <p className="body-text">
                {vehicle.powerText ||
                  "Engineered for relentless power delivery, instantaneous throttle response, and screaming exhaust acoustics."}
              </p>
              {p.engine && (
                <div className="metric-row">
                  <div className="metric-unit">
                    <span className="metric-val">{p.engine}</span>
                    <span className="metric-lbl">Powertrain</span>
                  </div>
                </div>
              )}
            </div>
            <div className="media-col">
              <div className="widescreen-frame">
                <img src={vehicle?.images?.power || heroImg} alt="Power" />
                <span className="media-badge">POWER</span>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 05 / TECHNICAL SPECIFICATIONS */}
        <section className="arch-section" id="specification">
          <span className="section-num">05 / SPECIFICATION</span>
          <h2 className="section-title">TECHNICAL SPECIFICATIONS</h2>

          <div className="arch-spec-table">
            {p.horsepower && (
              <div className="table-line">
                <span>Maximum Power</span>
                <strong>{p.horsepower}</strong>
              </div>
            )}
            {p.torque && (
              <div className="table-line">
                <span>Maximum Torque</span>
                <strong>{p.torque}</strong>
              </div>
            )}
            {p.acceleration0100 && (
              <div className="table-line">
                <span>0-100 km/h (0-60 mph)</span>
                <strong>{p.acceleration0100}</strong>
              </div>
            )}
            {p.acceleration0200 && (
              <div className="table-line">
                <span>0-200 km/h</span>
                <strong>{p.acceleration0200}</strong>
              </div>
            )}
            {p.topSpeed && (
              <div className="table-line">
                <span>Top Speed</span>
                <strong>{p.topSpeed}</strong>
              </div>
            )}
            {p.engine && (
              <div className="table-line">
                <span>Engine Configuration</span>
                <strong>{p.engine}</strong>
              </div>
            )}
            {p.transmission && (
              <div className="table-line">
                <span>Transmission</span>
                <strong>{p.transmission}</strong>
              </div>
            )}
            {p.chassis && (
              <div className="table-line">
                <span>Chassis Architecture</span>
                <strong>{p.chassis}</strong>
              </div>
            )}
            {p.weight && (
              <div className="table-line">
                <span>DIN Kerb / Dry Weight</span>
                <strong>{p.weight}</strong>
              </div>
            )}
            {p.brakes && (
              <div className="table-line">
                <span>Braking System</span>
                <strong>{p.brakes}</strong>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Minimal Luxury Purchase Request Modal Overlay */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close-btn"
              onClick={() => setIsModalOpen(false)}
              aria-label="Close"
            >
              ✕
            </button>

            <span className="modal-brand">{vehicle.brand || "MCLAREN"}</span>
            <h2>PURCHASE REQUEST: {vehicle.name}</h2>
            <p className="modal-subtitle">Starting Price: {vehicle.price}</p>

            {submitted ? (
              <div className="modal-success">
                <span className="check-mark">✓</span>
                <h3>PURCHASE REQUEST RECEIVED</h3>
                <p>
                  Thank you, <strong>{clientName}</strong>. A McLaren Specialist
                  will contact you at <strong>{clientEmail}</strong>.
                </p>
                <button className="modal-submit-btn" onClick={resetModal}>
                  Close Window
                </button>
              </div>
            ) : (
              <form onSubmit={handlePurchaseSubmit} className="modal-form">
                <div className="modal-field">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div className="modal-field">
                  <label>Email Address *</label>
                  <input
                    type="email"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder="email@example.com"
                    required
                  />
                </div>

                <div className="modal-field">
                  <label>Delivery Region *</label>
                  <select
                    value={deliveryRegion}
                    onChange={(e) => setDeliveryRegion(e.target.value)}
                  >
                    <option value="North America">North America</option>
                    <option value="Europe / UK">Europe / UK</option>
                    <option value="Middle East">Middle East</option>
                    <option value="Asia Pacific">Asia Pacific</option>
                  </select>
                </div>

                <div className="modal-field">
                  <label>Exterior Color Preference</label>
                  <input
                    type="text"
                    value={exteriorColor}
                    onChange={(e) => setExteriorColor(e.target.value)}
                    placeholder="Signature Papaya Spark"
                  />
                </div>

                <div className="modal-field">
                  <label>Additional Specification Notes</label>
                  <textarea
                    rows="3"
                    value={additionalNotes}
                    onChange={(e) => setAdditionalNotes(e.target.value)}
                    placeholder="Specify interior trim, track pack options, etc."
                  />
                </div>

                <label className="modal-checkbox-row">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    required
                  />
                  <span>I agree to the Terms &amp; Conditions.</span>
                </label>

                <button
                  type="submit"
                  className="modal-submit-btn"
                  disabled={!agreedToTerms}
                >
                  Submit Purchase Request →
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
