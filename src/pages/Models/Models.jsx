import { useState, useEffect, useMemo } from "react";
import "./Models.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Helper to ensure images load properly on both localhost and GitHub Pages
const resolveImgUrl = (src) => {
  if (!src) return "";
  if (
    src.startsWith("http://") ||
    src.startsWith("https://") ||
    src.startsWith("data:")
  ) {
    return src;
  }
  const cleanPath = src.replace(/^\.?\//, "");
  return `${import.meta.env.BASE_URL}${cleanPath}`;
};

export default function Models({ navigateTo }) {
  const [showroomCars, setShowroomCars] = useState([]);
  const [showroomPillars, setShowroomPillars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    let mounted = true;

    async function loadShowroomData() {
      try {
        setLoading(true);
        setError(null);

        const [carsRes, pillarsRes] = await Promise.all([
          fetch(`${API_BASE}/api/vehicles`),
          fetch(`${API_BASE}/api/pillars`),
        ]);

        if (!carsRes.ok) {
          throw new Error(`Server error: ${carsRes.statusText}`);
        }

        const carsData = await carsRes.json();
        const pillarsData = pillarsRes.ok ? await pillarsRes.json() : [];

        if (mounted) {
          setShowroomCars(
            Array.isArray(carsData) ? carsData : carsData.vehicles || [],
          );
          setShowroomPillars(Array.isArray(pillarsData) ? pillarsData : []);
        }
      } catch (err) {
        console.error("Failed to fetch showroom data from backend:", err);
        if (mounted) {
          setError(
            "Unable to load showroom data. Please check backend server.",
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadShowroomData();

    return () => {
      mounted = false;
    };
  }, []);

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

  if (error) {
    return (
      <div className="no-vehicles">
        <h3>Backend Server Offline</h3>
        <p>{error}</p>
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
            {/* 1. PHOTO FRAME */}
            <div className="showcase-photo-frame">
              <img
                src={resolveImgUrl(
                  activeCar?.images?.exterior || activeCar?.image || "",
                )}
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

            {/* 2. DETAILS & BUTTONS */}
            <div className="showcase-under-details">
              <div className="title-price-row">
                <h2 className="model-name">{activeCar?.name}</h2>
                <span className="price-tag">
                  {activeCar?.price || "Inquire"}
                </span>
              </div>

              <p className="model-summary">
                {activeCar?.summary ||
                  "Engineered without compromise for pure driver engagement."}
              </p>

              {/* Specs Bar */}
              <div className="showcase-specs-strip">
                <div className="spec-item">
                  <span className="spec-val">
                    {activeCar?.performance?.horsepower || "N/A"}
                  </span>
                  <span className="spec-lbl">Power</span>
                </div>
                <div className="spec-item">
                  <span className="spec-val">
                    {activeCar?.performance?.acceleration || "N/A"}
                  </span>
                  <span className="spec-lbl">0-60 MPH</span>
                </div>
                <div className="spec-item">
                  <span className="spec-val">
                    {activeCar?.performance?.topSpeed || "N/A"}
                  </span>
                  <span className="spec-lbl">Top Speed</span>
                </div>
                <div className="spec-item">
                  <span className="spec-val">
                    {activeCar?.performance?.engine || "N/A"}
                  </span>
                  <span className="spec-lbl">Engine</span>
                </div>
              </div>

              {/* Action Button */}
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
                const thumbImg = car?.images?.exterior || car?.image || "";

                return (
                  <button
                    key={car.id}
                    className={`thumb-card ${
                      idx === activeIndex ? "active" : ""
                    }`}
                    onClick={() => setActiveIndex(idx)}
                  >
                    <div className="thumb-img-wrapper">
                      <img src={resolveImgUrl(thumbImg)} alt={car.name} />
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

      {/* SECTION 2: FULL SHOWROOM LINEUP CATALOG */}
      <section className="showroom-catalog-section">
        <header className="catalog-header">
          <h3>COMPLETE FLEET</h3>
          <h2>All Showroom Models</h2>
        </header>

        <div className="catalog-list">
          {showroomCars.map((car) => {
            const carImg = car?.images?.exterior || car?.image || "";
            const hp = car?.performance?.horsepower || "N/A";
            const zeroSixty = car?.performance?.acceleration || "N/A";

            return (
              <div
                className="catalog-row"
                key={car.id}
                onClick={() => navigateTo("vehicle-details", car.id)}
              >
                <div className="catalog-thumb">
                  <img src={resolveImgUrl(carImg)} alt={car.name} />
                </div>
                <div className="catalog-details">
                  <span className="catalog-series">{car.series}</span>
                  <h3 className="catalog-name">{car.name}</h3>
                  <p className="catalog-summary">{car.summary}</p>
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

      {/* SECTION 3: MCLAREN ENGINEERING HIGHLIGHTS */}
      {showroomPillars.length > 0 && (
        <section className="showroom-pillars-section">
          <header className="pillars-header">
            <h3>SUPERCAR DNA</h3>
            <h2>Hand-Crafted Performance</h2>
          </header>
          <div className="pillars-grid">
            {showroomPillars.map((p) => (
              <div className="pillar-card" key={p.id || p.title}>
                <h3>{p.title}</h3>
                <p>{p.text}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
