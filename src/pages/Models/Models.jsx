/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useMemo } from "react";
import { db } from "../../firebase/config";
import { collection, getDocs } from "firebase/firestore";
import "./Models.css";

/* ---------------- Sample Data (Fallback Showroom) ---------------- */
const SAMPLE_CARS = [
  {
    id: "mclaren-720s",
    name: "720S Spider",
    series: "Super Series",
    price: "$315,000",
    summary:
      "An open-top benchmark supercar engineered for relentless power, active downforce, and uncompromised road presence.",
    image: "./cars/mclaren-1.jpg",
    performance: {
      horsepower: "710 PS",
      acceleration: "2.9 s",
      topSpeed: "212 MPH",
      engine: "4.0L Twin-Turbo V8",
    },
  },
  {
    id: "mclaren-artura",
    name: "Artura",
    series: "High-Performance Hybrid",
    price: "$237,500",
    summary:
      "Next-generation electrified hybrid performance blending instant electric torque with a howling twin-turbo V6.",
    image: "./cars/mclaren-2.jpg",
    performance: {
      horsepower: "690 PS",
      acceleration: "3.0 s",
      topSpeed: "205 MPH",
      engine: "3.0L V6 Hybrid",
    },
  },
  {
    id: "mclaren-750s",
    name: "750S Spider",
    series: "Super Series",
    price: "$337,195",
    summary:
      "Lighter, faster, and louder. The purest expression of raw driver engagement with a 13-second folding hardtop.",
    image: "./cars/mclaren-3.jpeg",
    performance: {
      horsepower: "740 PS",
      acceleration: "2.8 s",
      topSpeed: "206 MPH",
      engine: "4.0L Twin-Turbo V8",
    },
  },
  {
    id: "mclaren-w1",
    name: "W1 Hypercar",
    series: "Ultimate Series",
    price: "$2,100,000",
    summary:
      "Our Formula One-inspired ground-effect flagship hypercar redefining aerodynamics and hybrid hypercar performance.",
    image: "./cars/W1-hypercar.webp",
    performance: {
      horsepower: "1,258 PS",
      acceleration: "2.6 s",
      topSpeed: "217 MPH",
      engine: "4.0L V8 Hybrid",
    },
  },
];

const SHOWROOM_PILLARS = [
  {
    title: "Carbon Monocage II",
    text: "Formula 1 derived carbon monocoque cell providing maximum torsional rigidity and lightweight safety.",
  },
  {
    title: "Proactive Chassis Control",
    text: "Hydraulically interlinked suspension adapting dampers in milliseconds for ultimate cornering grip.",
  },
  {
    title: "Active Aerodynamics",
    text: "Continuously adjusting active rear wing and front air splitters optimizing downforce and drag.",
  },
];

export default function Models({ navigateTo }) {
  const [showroomCars, setShowroomCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    let mounted = true;

    async function loadCars() {
      try {
        const snapshot = await getDocs(collection(db, "vehicles"));

        const cars = [];

        snapshot.forEach((doc) => {
          cars.push({
            id: doc.id,
            ...doc.data(),
          });
        });

        if (mounted) {
          setShowroomCars(cars.length ? cars : SAMPLE_CARS);
        }
      } catch (error) {
        console.log(error);

        if (mounted) {
          setShowroomCars(SAMPLE_CARS);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadCars();

    return () => {
      mounted = false;
    };
  }, []);

  // Filter cars dynamically
  const filteredCars = useMemo(() => {
    return showroomCars.filter((car) => {
      const nameMatch = (car?.name || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const seriesMatch = (car?.series || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      const matchesSearch = nameMatch || seriesMatch;

      if (activeCategory === "All") return matchesSearch;
      if (activeCategory === "Super Series")
        return matchesSearch && car?.series?.toLowerCase().includes("super");
      if (activeCategory === "Hybrid")
        return matchesSearch && car?.series?.toLowerCase().includes("hybrid");
      if (activeCategory === "Ultimate Series")
        return matchesSearch && car?.series?.toLowerCase().includes("ultimate");

      return matchesSearch;
    });
  }, [showroomCars, activeCategory, searchQuery]);

  useEffect(() => {
    setActiveIndex(0);
  }, [activeCategory, searchQuery]);

  const activeCar = filteredCars[activeIndex] || filteredCars[0];

  const handleNext = () => {
    if (filteredCars.length === 0) return;
    setActiveIndex((prev) => (prev + 1) % filteredCars.length);
  };

  const handlePrev = () => {
    if (filteredCars.length === 0) return;
    setActiveIndex(
      (prev) => (prev - 1 + filteredCars.length) % filteredCars.length,
    );
  };

  if (loading) {
    return (
      <div className="showroom-loading">
        <div className="loading-spinner" aria-hidden="true" />
        <span>ENTERING SHOWROOM...</span>
      </div>
    );
  }

  return (
    <div className="showroom-layout">
      {/* Top Header & Filter Controls */}
      <header className="showroom-header">
        <div className="header-top">
          <span className="brand-label">McLaren Fleet</span>
          <h1>THE MCLAREN SHOWROOM</h1>
          <p>
            Choose between lightweight twin-turbocharged internal combustion
            benchmark platforms or modern electrified hybrid setups.
          </p>
        </div>

        <div className="showroom-filter-bar">
          <div className="category-tabs">
            {["All", "Super Series", "Hybrid", "Ultimate Series"].map((cat) => (
              <button
                key={cat}
                className={`tab-btn ${activeCategory === cat ? "active" : ""}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="search-box">
            <input
              type="text"
              placeholder="Search model or engine..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                className="clear-search"
                onClick={() => setSearchQuery("")}
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Feature Showcase */}
      {filteredCars.length === 0 ? (
        <div className="no-vehicles">
          <h3>No Models Found</h3>
          <p>Try resetting your search filters.</p>
          <button
            className="showroom-btn solid"
            onClick={() => {
              setActiveCategory("All");
              setSearchQuery("");
            }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <section className="showcase-section">
          <div className="showcase-card">
            {/* 1. PHOTO FRAME (With Vertically Centered Arrows) */}
            <div className="showcase-photo-frame">
              <img
                src={
                  activeCar?.images?.exterior ||
                  activeCar?.image ||
                  "./cars/mclaren-1.jpg"
                }
                alt={activeCar?.name}
                referrerPolicy="no-referrer"
                loading="lazy"
              />

              {/* Slider Arrows */}
              {filteredCars.length > 1 && (
                <>
                  <button
                    className="stage-arrow left"
                    onClick={handlePrev}
                    aria-label="Previous vehicle"
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="15 18 9 12 15 6" />
                    </svg>
                  </button>
                  <button
                    className="stage-arrow right"
                    onClick={handleNext}
                    aria-label="Next vehicle"
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                </>
              )}

              {/* Photo Top Overlay Badges */}
              <div className="photo-badge-bar">
                <span className="series-tag">
                  {activeCar?.series || "McLaren"}
                </span>
                <span className="counter-tag">
                  {String(activeIndex + 1).padStart(2, "0")} /{" "}
                  {String(filteredCars.length).padStart(2, "0")}
                </span>
              </div>
            </div>

            {/* 2. DETAILS & BUTTONS KEPT UNDER THE IMAGE */}
            <div className="showcase-under-details">
              <div className="title-price-row">
                <h2 className="model-name">{activeCar?.name}</h2>
                <span className="price-tag">
                  {activeCar?.price || "Inquire"}
                </span>
              </div>

              <p className="model-summary">
                {activeCar?.summary ||
                  activeCar?.overview ||
                  "Engineered without compromise for pure driver engagement."}
              </p>

              {/* Specs Bar */}
              <div className="showcase-specs-strip">
                <div className="spec-item">
                  <span className="spec-val">
                    {activeCar?.performance?.horsepower ||
                      activeCar?.hp ||
                      "710 PS"}
                  </span>
                  <span className="spec-lbl">Power</span>
                </div>
                <div className="spec-item">
                  <span className="spec-val">
                    {activeCar?.performance?.acceleration ||
                      activeCar?.zeroSixty ||
                      "2.8 s"}
                  </span>
                  <span className="spec-lbl">0-60 MPH</span>
                </div>
                <div className="spec-item">
                  <span className="spec-val">
                    {activeCar?.performance?.topSpeed ||
                      activeCar?.topSpeed ||
                      "212 MPH"}
                  </span>
                  <span className="spec-lbl">Top Speed</span>
                </div>
                <div className="spec-item">
                  <span className="spec-val">
                    {activeCar?.performance?.engine || "Twin-Turbo V8"}
                  </span>
                  <span className="spec-lbl">Engine</span>
                </div>
              </div>

              {/* Single Action: Explore Details (Purchase Request lives on that page) */}
              <div className="showcase-actions">
                <button
                  className="showroom-btn solid"
                  onClick={() => navigateTo("vehicle-details", activeCar?.id)}
                >
                  Explore {activeCar?.name} Details →
                </button>
              </div>
            </div>
          </div>

          {/* Model Thumbnail Selector Bar */}
          <div className="thumbnail-track-container">
            <span className="track-title">SELECT MODEL</span>
            <div className="thumbnail-track">
              {filteredCars.map((car, idx) => {
                const thumbImg =
                  car?.images?.exterior || car?.image || "./cars/mclaren-1.jpg";

                return (
                  <button
                    key={car.id}
                    className={`thumb-card ${
                      idx === activeIndex ? "active" : ""
                    }`}
                    onClick={() => setActiveIndex(idx)}
                  >
                    <div className="thumb-img-wrapper">
                      <img src={thumbImg} alt={car.name} />
                    </div>
                    <div className="thumb-info">
                      <span className="thumb-name">{car.name}</span>
                      <span className="thumb-series">{car.series}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* SECTION 2: FULL SHOWROOM LINEUP CATALOG (Makes Page Longer) */}
      <section className="showroom-catalog-section">
        <header className="catalog-header">
          <h3>COMPLETE FLEET</h3>
          <h2>All Showroom Models</h2>
        </header>

        <div className="catalog-list">
          {showroomCars.map((car) => {
            const carImg =
              car?.images?.exterior || car?.image || "./cars/mclaren-1.jpg";
            const hp = car?.performance?.horsepower || car?.hp || "710 PS";
            const zeroSixty =
              car?.performance?.acceleration || car?.zeroSixty || "2.8 s";

            return (
              <div
                className="catalog-row"
                key={car.id}
                onClick={() => navigateTo("vehicle-details", car.id)}
              >
                <div className="catalog-thumb">
                  <img src={carImg} alt={car.name} />
                </div>
                <div className="catalog-details">
                  <span className="catalog-series">{car.series}</span>
                  <h3 className="catalog-name">{car.name}</h3>
                  <p className="catalog-summary">
                    {car.summary || car.overview}
                  </p>
                </div>
                <div className="catalog-specs-col">
                  <span>
                    <strong>{hp}</strong> Output
                  </span>
                  <span>
                    <strong>{zeroSixty}</strong> 0-60 MPH
                  </span>
                </div>
                <div className="catalog-actions-col">
                  <span className="catalog-price">{car.price}</span>
                  <button
                    className="showroom-btn solid sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigateTo("vehicle-details", car.id);
                    }}
                  >
                    View Specs →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION 3: MCLAREN ENGINEERING HIGHLIGHTS (Makes Page Richer) */}
      <section className="showroom-pillars-section">
        <header className="pillars-header">
          <h3>SUPERCAR DNA</h3>
          <h2>Hand-Crafted Performance</h2>
        </header>
        <div className="pillars-grid">
          {SHOWROOM_PILLARS.map((p) => (
            <div className="pillar-card" key={p.title}>
              <h3>{p.title}</h3>
              <p>{p.text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
