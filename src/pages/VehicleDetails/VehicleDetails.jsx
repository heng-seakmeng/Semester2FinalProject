import { useState, useEffect } from "react";
import { db } from "../../firebase/config";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { doc, getDoc } from "firebase/firestore";
import "./VehicleDetails.css";

/* ---------------- Dynamic Database per Vehicle ---------------- */
const VEHICLE_DATABASE = {
  "mclaren-750s": {
    id: "mclaren-750s",
    name: "750S SPIDER",
    brand: "McLaren",
    series: "SUPER SERIES",
    price: "$337,195",
    image: "./cars/mclaren-3.jpeg",
    images: {
      hero: "./cars/mclaren-3.jpeg",
      overview: "./cars/mclaren-3.jpeg",
      lightness: "./cars/mclaren-1.jpg",
      engagement: "./cars/mclaren-4.jpeg",
      power: "./cars/mclaren-12.jpg",
      specification: "./cars/mclaren-2.jpg",
    },
    performance: {
      horsepower: "750 PS / 740 HP",
      topSpeed: "332 km/h / 206 MPH",
      torque: "800 Nm / 590 lb-ft",
      acceleration0100: "2.8s",
      acceleration0200: "7.2s",
      engine: "M840T 4.0L Twin-Turbocharged V8",
      weight: "1,281 kg",
      transmission: "7-Speed Dual-Clutch SSG",
      chassis: "Carbon Fibre Monocage II",
      brakes: "Carbon Ceramic Discs (390mm / 380mm)",
    },
    overviewHeadline: "RELENTLESS PROGRESS. MORE POWER. MORE CONTROL.",
    overviewText:
      "The 750S takes the McLaren ethos to a new apex. True to its DNA, it's the next-level supercar, surpassing benchmarks for performance, engagement and purity of response. Defined by the relentless pursuit of lightness.",
    lightnessHeadline: "LIGHTWEIGHT COMPOSITE PURSUIT",
    lightnessText:
      "30% of components are new or revised compared to the 720S, resulting in an overall 30kg weight reduction down to 1,281 kg dry weight with carbon seats and forged wheels.",
    engagementHeadline: "SURGICAL STEERING & PROACTIVE CHASSIS CONTROL III",
    engagementText:
      "Features a 6mm wider front track, twin-valve hydraulic dampers, faster steering rack ratio, and a 15% shorter final drive ratio for explosive acceleration.",
    powerHeadline: "MID-MOUNTED 4.0L TWIN-TURBO V8 ENGINE",
    powerText:
      "At the heart of the 750S is a 4-litre twin-turbocharged V8 engine mid-mounted for perfect weight distribution generating 750PS and 800Nm of torque.",
  },
  "mclaren-720s": {
    id: "mclaren-720s",
    name: "720S SPIDER",
    brand: "McLaren",
    series: "SUPER SERIES",
    price: "$315,000",
    image: "./cars/mclaren-1.jpg",
    images: {
      hero: "./cars/mclaren-1.jpg",
      overview: "./cars/mclaren-1.jpg",
      lightness: "./cars/mclaren-2.jpg",
      engagement: "./cars/mclaren-4.jpeg",
      power: "./cars/mclaren-12.jpg",
      specification: "./cars/mclaren-3.jpeg",
    },
    performance: {
      horsepower: "710 PS / 700 HP",
      topSpeed: "341 km/h / 212 MPH",
      torque: "770 Nm / 568 lb-ft",
      acceleration0100: "2.9s",
      acceleration0200: "7.9s",
      engine: "M840T 4.0L Twin-Turbo V8",
      weight: "1,332 kg",
      transmission: "7-Speed Dual-Clutch SSG",
      chassis: "Carbon Fibre Monocage II-S",
      brakes: "Carbon Ceramic Discs (390mm / 380mm)",
    },
    overviewHeadline: "BENCHMARK PERFORMANCE & OPEN-TOP FEROCITY",
    overviewText:
      "The McLaren 720S Spider is the culmination of our pursuit to push the boundaries of open-top supercar performance. Lighter, stronger, and faster than its predecessor.",
    lightnessHeadline: "CARBON FIBRE MONOCAGE II-S ARCHITECTURE",
    lightnessText:
      "Derived from Formula 1 composite technology, it provides immense structural rigidity without requiring additional weight reinforcement when lowering the hardtop roof.",
    engagementHeadline: "SURGICAL HYDRAULIC STEERING FEEDBACK",
    engagementText:
      "Electro-hydraulic steering provides pure, unassisted dynamic feel. Proactive Chassis Control II continuously calculates road surface inputs.",
    powerHeadline: "FEROCIOUS 710 HP TWIN-TURBOCHARGED V8",
    powerText:
      "Generating 710 HP and 770 Nm of torque, the twin-scroll turbocharged V8 engine propels the 720S Spider from 0 to 200 km/h in 7.9 seconds up to 341 km/h.",
  },
  "mclaren-artura": {
    id: "mclaren-artura",
    name: "ARTURA",
    brand: "McLaren",
    series: "HIGH-PERFORMANCE HYBRID",
    price: "$237,500",
    image: "./cars/mclaren-2.jpg",
    images: {
      hero: "./cars/mclaren-2.jpg",
      overview: "./cars/mclaren-2.jpg",
      lightness: "./cars/mclaren-1.jpg",
      engagement: "./cars/mclaren-4.jpeg",
      power: "./cars/mclaren-12.jpg",
      specification: "./cars/mclaren-3.jpeg",
    },
    performance: {
      horsepower: "690 PS / 671 HP",
      topSpeed: "330 km/h / 205 MPH",
      torque: "720 Nm / 531 lb-ft",
      acceleration0100: "3.0s",
      acceleration0200: "8.3s",
      engine: "3.0L Twin-Turbo V6 Hybrid",
      weight: "1,395 kg",
      transmission: "8-Speed Dual-Clutch with E-Reverse",
      chassis: "McLaren Carbon Lightweight Architecture",
      brakes: "Carbon Ceramic Discs (390mm / 380mm)",
    },
    overviewHeadline: "REVOLUTIONARY HIGH-PERFORMANCE HYBRID",
    overviewText:
      "The McLaren Artura represents a clean-sheet design as our first series-production High-Performance Hybrid (HPH) supercar.",
    lightnessHeadline: "McLAREN CARBON LIGHTWEIGHT ARCHITECTURE",
    lightnessText:
      "The MCLA carbon monocoque is designed specifically to integrate the 7.4kWh hybrid battery system while maintaining a light dry weight of 1,395 kg.",
    engagementHeadline: "ELECTRONIC DIFFERENTIAL & TORQUE VECTORING",
    engagementText:
      "An electronic differential (E-diff) manages torque distribution across the rear axle, complementing electro-hydraulic steering for dynamic turn-in precision.",
    powerHeadline: "120-DEGREE V6 ENGINE & INSTANT E-TORQUE",
    powerText:
      "The wide-angle 120-degree V6 engine houses twin turbochargers inside the 'hot V' producing 585PS plus 95PS from the E-motor.",
  },
  "mclaren-w1": {
    id: "mclaren-w1",
    name: "W1 HYPERCAR",
    brand: "McLaren",
    series: "ULTIMATE SERIES",
    price: "$2,100,000",
    image: "./cars/W1-hypercar.webp",
    images: {
      hero: "./cars/W1-hypercar.webp",
      overview: "./cars/mclaren-12.jpg",
      lightness: "./cars/mclaren-4.jpeg",
      engagement: "./cars/mclaren-2.jpg",
      power: "./cars/mclaren-3.jpeg",
      specification: "./cars/mclaren-1.jpg",
    },
    performance: {
      horsepower: "1,258 PS / 1,241 HP",
      topSpeed: "350 km/h / 217 MPH",
      torque: "1,340 Nm / 988 lb-ft",
      acceleration0100: "2.6s",
      acceleration0200: "5.8s",
      engine: "4.0L High-RPM V8 Hybrid",
      weight: "1,399 kg",
      transmission: "8-Speed Dual-Clutch SSG",
      chassis: "Bespoke Aerocell Carbon Monocoque",
      brakes: "Carbon-Ceramic Racing Discs (390mm)",
    },
    overviewHeadline: "FORMULA ONE GROUND-EFFECT FLAGSHIP HYPERCAR",
    overviewText:
      "The McLaren W1 is the ground-effect successor to the legendary F1 and P1 hypercars featuring Active Long Tail aerodynamics.",
    lightnessHeadline: "BESPOKE AEROCELL CARBON MONOCOQUE",
    lightnessText:
      "The Aerocell carbon structure incorporates fixed seating positions, shortening wheelbase requirement by 70mm and reducing structural weight.",
    engagementHeadline: "1,000 KG ACTIVE GROUND-EFFECT DOWNFORCE",
    engagementText:
      "Race mode lowers ride height by 37mm at front and 17mm at rear, creating high-downforce ground-effect suction through underbody tunnels.",
    powerHeadline: "1,258 HP HIGH-RPM HYBRID POWERHOUSE",
    powerText:
      "A 9,200 RPM 4.0L V8 engine paired with a Formula 1 E-module produces 1,258 HP and 1,340 Nm torque, launching 0-300 km/h in 12.7s.",
  },
};

function resolveVehicleData(id) {
  if (!id) return VEHICLE_DATABASE["mclaren-750s"];
  if (VEHICLE_DATABASE[id]) return VEHICLE_DATABASE[id]; // ← add this line
  const lower = id.toLowerCase();
  if (lower.includes("720")) return VEHICLE_DATABASE["mclaren-720s"];
  if (lower.includes("artura")) return VEHICLE_DATABASE["mclaren-artura"];
  if (lower.includes("750")) return VEHICLE_DATABASE["mclaren-750s"];
  if (lower.includes("w1")) return VEHICLE_DATABASE["mclaren-w1"];
  return VEHICLE_DATABASE["mclaren-750s"];
}

export default function VehicleDetails({ carId }) {
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("overview");

  // Single Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [deliveryRegion, setDeliveryRegion] = useState("North America");
  const [exteriorColor, setExteriorColor] = useState("Signature Papaya Spark");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Dynamic Car Fetching
  useEffect(() => {
    async function loadVehicle() {
      setLoading(true);
      try {
        if (carId && db) {
          const docRef = doc(db, "vehicles", carId);
          const snap = await getDoc(docRef);
          if (snap.exists()) {
            // const data = snap.data();
            setVehicle(resolveVehicleData(carId)); // ← fixed
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn("Firestore error, loading fallback: ", err);
      }

      setVehicle(resolveVehicleData(carId));
      setLoading(false);
    }

    loadVehicle();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [carId]);

  // Scrollspy: Auto-Active Subnav button on scroll
  useEffect(() => {
    if (loading || !vehicle) return;

    const sections = [
      "overview",
      "lightness",
      "engagement",
      "power",
      "specification",
    ];

    const observerOptions = {
      root: null,
      rootMargin: "-20% 0px -50% 0px",
      threshold: 0,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, observerOptions);

    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [loading, vehicle]);

  // Smooth Scroll
  const scrollToSection = (id) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -70;
      const y =
        element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  const handlePurchaseSubmit = async (e) => {
    e.preventDefault();
    if (!agreedToTerms) return;

    try {
      await addDoc(collection(db, "purchase_requests"), {
        clientName: clientName,
        clientEmail: clientEmail,
        vehicleName: vehicle.name,
        carModel: vehicle.id,
        deliveryRegion: deliveryRegion,
        exteriorColor: exteriorColor,
        additionalNotes: additionalNotes,
        status: "Pending Review",
        submittedAt: serverTimestamp(),
      });
      setSubmitted(true);
    } catch (err) {
      console.error("Error saving purchase request:", err);
      alert("Something went wrong. Please try again.");
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

  // Dynamic Car Images
  const heroImg =
    vehicle?.images?.hero || vehicle?.images?.exterior || vehicle?.image;
  const overviewImg = vehicle?.images?.overview || heroImg;
  const lightnessImg = vehicle?.images?.lightness || heroImg;
  const engagementImg = vehicle?.images?.engagement || heroImg;
  const powerImg = vehicle?.images?.power || heroImg;

  return (
    <div className="arch-editorial-page">
      {/* 1. CLEAN WIDESCREEN HERO BANNER */}
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

      {/* 2. STICKY SUB-NAV BAR (WITH EXACTLY ONE PURCHASE REQUEST BUTTON) */}
      <nav className="arch-subnav">
        <div className="subnav-container">
          <div className="subnav-links">
            {[
              { id: "overview", label: "OVERVIEW" },
              { id: "lightness", label: "LIGHTNESS" },
              { id: "engagement", label: "ENGAGEMENT" },
              { id: "power", label: "POWER" },
              { id: "specification", label: "SPECIFICATION" },
            ].map((navItem) => (
              <button
                key={navItem.id}
                className={`subnav-link ${
                  activeSection === navItem.id ? "active" : ""
                }`}
                onClick={() => scrollToSection(navItem.id)}
              >
                {navItem.label}
              </button>
            ))}
          </div>

          {/* THE ONLY PURCHASE REQUEST BUTTON ON THE PAGE */}
          <button
            className="single-purchase-btn"
            onClick={() => setIsModalOpen(true)}
          >
            PURCHASE REQUEST →
          </button>
        </div>
      </nav>

      {/* 3. ARCHITECTURAL EDITORIAL CONTENT BODY (PURE INFORMATION, NO FORMS) */}
      <main className="arch-editorial-body">
        {/* SECTION 01: OVERVIEW */}
        <section className="arch-section" id="overview">
          <div className="section-split">
            <div className="text-col">
              <span className="section-num">01 / OVERVIEW</span>
              <h2 className="section-title">{vehicle.overviewHeadline}</h2>
              <p className="body-text">{vehicle.overviewText}</p>

              <div className="metric-row">
                <div className="metric-unit">
                  <span className="metric-val">
                    {vehicle.performance?.horsepower}
                  </span>
                  <span className="metric-lbl">Power Output</span>
                </div>
                <div className="metric-unit">
                  <span className="metric-val">
                    {vehicle.performance?.topSpeed}
                  </span>
                  <span className="metric-lbl">Top Speed</span>
                </div>
              </div>
            </div>

            <div className="media-col">
              <div className="widescreen-frame">
                <img src={overviewImg} alt={`${vehicle.name} Overview`} />
                <span className="media-badge">{vehicle.name} Exterior</span>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 02: LIGHTNESS */}
        <section className="arch-section" id="lightness">
          <div className="section-split">
            <div className="text-col">
              <span className="section-num">02 / LIGHTNESS</span>
              <h2 className="section-title">{vehicle.lightnessHeadline}</h2>
              <p className="body-text">{vehicle.lightnessText}</p>

              <div className="metric-row">
                <div className="metric-unit">
                  <span className="metric-val">
                    {vehicle.performance?.weight}
                  </span>
                  <span className="metric-lbl">Overall Dry Weight</span>
                </div>
                <div className="metric-unit">
                  <span className="metric-val">
                    {vehicle.performance?.chassis}
                  </span>
                  <span className="metric-lbl">Carbon Monocoque</span>
                </div>
              </div>
            </div>

            <div className="media-col">
              <div className="widescreen-frame">
                <img src={lightnessImg} alt={`${vehicle.name} Lightness`} />
                <span className="media-badge">Carbon Fibre Composites</span>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 03: ENGAGEMENT */}
        <section className="arch-section" id="engagement">
          <div className="section-split">
            <div className="text-col">
              <span className="section-num">03 / ENGAGEMENT</span>
              <h2 className="section-title">{vehicle.engagementHeadline}</h2>
              <p className="body-text">{vehicle.engagementText}</p>

              <div className="metric-row">
                <div className="metric-unit">
                  <span className="metric-val">
                    {vehicle.performance?.acceleration0100}
                  </span>
                  <span className="metric-lbl">0-100 km/h</span>
                </div>
                <div className="metric-unit">
                  <span className="metric-val">PCC III</span>
                  <span className="metric-lbl">Proactive Suspension</span>
                </div>
              </div>
            </div>

            <div className="media-col">
              <div className="widescreen-frame">
                <img src={engagementImg} alt={`${vehicle.name} Engagement`} />
                <span className="media-badge">Active Aerodynamics</span>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 04: POWER */}
        <section className="arch-section" id="power">
          <div className="section-split">
            <div className="text-col">
              <span className="section-num">04 / POWER</span>
              <h2 className="section-title">{vehicle.powerHeadline}</h2>
              <p className="body-text">{vehicle.powerText}</p>

              <div className="metric-row">
                <div className="metric-unit">
                  <span className="metric-val">
                    {vehicle.performance?.engine}
                  </span>
                  <span className="metric-lbl">Engine Configuration</span>
                </div>
                <div className="metric-unit">
                  <span className="metric-val">
                    {vehicle.performance?.torque}
                  </span>
                  <span className="metric-lbl">Peak Torque</span>
                </div>
              </div>
            </div>

            <div className="media-col">
              <div className="widescreen-frame">
                <img src={powerImg} alt={`${vehicle.name} Powertrain`} />
                <span className="media-badge">Mid-Mounted V8 Core</span>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 05: SPECIFICATION */}
        <section className="arch-section" id="specification">
          <span className="section-num">05 / SPECIFICATION</span>
          <h2 className="section-title">TECHNICAL FACTS &amp; FIGURES</h2>

          <div className="arch-spec-table">
            <div className="table-line">
              <span>Engine Configuration</span>
              <strong>{vehicle.performance?.engine}</strong>
            </div>
            <div className="table-line">
              <span>Horsepower Output</span>
              <strong>{vehicle.performance?.horsepower}</strong>
            </div>
            <div className="table-line">
              <span>Peak Torque</span>
              <strong>{vehicle.performance?.torque}</strong>
            </div>
            <div className="table-line">
              <span>0-100 km/h Acceleration</span>
              <strong>{vehicle.performance?.acceleration0100}</strong>
            </div>
            <div className="table-line">
              <span>Transmission</span>
              <strong>{vehicle.performance?.transmission}</strong>
            </div>
            <div className="table-line">
              <span>Chassis Structure</span>
              <strong>{vehicle.performance?.chassis}</strong>
            </div>
            <div className="table-line">
              <span>Braking System</span>
              <strong>{vehicle.performance?.brakes}</strong>
            </div>
            <div className="table-line">
              <span>Overall Dry Weight</span>
              <strong>{vehicle.performance?.weight}</strong>
            </div>
            <div className="table-line">
              <span>Starting Retail Price</span>
              <strong>{vehicle.price}</strong>
            </div>
          </div>
        </section>
      </main>

      {/* 4. PURCHASE REQUEST MODAL DRAWER (OPENS WHEN BUTTON IS CLICKED) */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close-btn"
              onClick={() => setIsModalOpen(false)}
            >
              ✕
            </button>

            <span className="modal-brand">McLAREN CLIENT CONCIERGE</span>
            <h2>PURCHASE REQUEST: {vehicle.name}</h2>
            <p className="modal-subtitle">Starting Price: {vehicle.price}</p>

            {submitted ? (
              <div className="modal-success">
                <span className="check-mark">✓</span>
                <h3>PURCHASE REQUEST RECEIVED</h3>
                <p>
                  Thank you, <strong>{clientName}</strong>. A McLaren Client
                  Specialist will contact you at <strong>{clientEmail}</strong>.
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
                    // placeholder="e.g. James W."
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    required
                  />
                </div>

                <div className="modal-field">
                  <label>Email Address *</label>
                  <input
                    type="email"
                    // placeholder="client@mclaren.com"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
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
                  <label>Preferred Exterior Color</label>
                  <select
                    value={exteriorColor}
                    onChange={(e) => setExteriorColor(e.target.value)}
                  >
                    <option value="Signature Papaya Spark">
                      Signature Papaya Spark
                    </option>
                    <option value="McLaren Orange">McLaren Orange</option>
                    <option value="Borealis Green">Borealis Green</option>
                    <option value="MSO Bespoke Tinted Carbon">
                      MSO Bespoke Tinted Carbon
                    </option>
                  </select>
                </div>

                <div className="modal-field">
                  <label>Additional Notes (Optional)</label>
                  <textarea
                    placeholder="Any specific requests or questions..."
                    value={additionalNotes}
                    onChange={(e) => setAdditionalNotes(e.target.value)}
                    rows={3}
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
