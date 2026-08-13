import { useEffect, useState } from "react";
import "./Home.css";
import "./ModelSpotLight.css";

const API_BASE = "http://localhost:3000"; // Express server URL

/* ---------------- Unified Model Card ---------------- */

function ModelShowcaseCard({ model, navigateTo }) {
  return (
    <article className="showcase-card">
      <div className="showcase-img-frame">
        <img src={model.image} alt={model.name} loading="lazy" />
        <span className="showcase-series-tag">{model.series}</span>
      </div>
      <div className="showcase-card-footer">
        <div className="showcase-card-info">
          <h2 className="showcase-car-name">{model.name}</h2>
          <span className="showcase-car-price">{model.price}</span>
        </div>
        <button
          className="btn-main fill"
          onClick={() => navigateTo("vehicle-details", model.id)}
        >
          View Full Specs →
        </button>
      </div>
    </article>
  );
}

/* ---------------- Page Component ---------------- */

export default function Home({ navigateTo }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/home`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch home data");
        return res.json();
      })
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="home-layout">Loading...</div>;
  if (error) return <div className="home-layout">Error: {error}</div>;

  const { stats, models, pillars, milestones, reviews, experiences } = data;

  return (
    <div className="home-layout">
      {/* Hero */}
      <section className="hero-banner hero-banner--video">
        <video
          className="hero-video"
          autoPlay
          muted
          loop
          playsInline
          poster="./cars/mclaren-1.jpg"
        >
          <source src="./video/mclaren-hero.mp4" type="video/mp4" />
        </video>
        <div className="hero-video-overlay" aria-hidden="true" />

        <div className="banner-tint">
          <span className="brand-label">McLaren Automotive</span>
          <h1>THE BENCHMARK OF PERFORMANCE</h1>
          <p>
            Hand-crafted supercars designed to minimize dead weight and maximize
            driver involvement. Explore the next generation of track-derived
            models built to provide an immediate connection to the tarmac.
          </p>
          <div className="banner-ctas">
            <button
              className="btn-main fill"
              onClick={() => navigateTo("models")}
            >
              Explore Models
            </button>
            <button
              className="btn-main outline"
              onClick={() => navigateTo("about")}
            >
              Discover Innovation
            </button>
          </div>
        </div>

        <button
          className="hero-scroll-indicator"
          aria-label="Scroll to explore"
          onClick={() =>
            window.scrollTo({ top: window.innerHeight, behavior: "smooth" })
          }
        >
          <span className="scroll-line" aria-hidden="true" />
          Scroll
        </button>
      </section>

      {/* Performance Stats */}
      <section className="stats-section">
        <div className="stats-container">
          {stats.map((stat, i) => (
            <div className="stat-card" key={stat.label}>
              <div className="stat-value">
                {stat.value}
                <span className="stat-suffix">{stat.suffix}</span>
              </div>
              <div className="stat-label">{stat.label}</div>
              {i < stats.length - 1 && (
                <span className="stat-divider" aria-hidden="true" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Featured Models Lineup */}
      <section className="lineup-section">
        <header className="first-intro">
          <h3>THE LINEUP</h3>
          <h2>Featured Models</h2>
          <p>
            Each McLaren is a distinct expression of speed, design, and driving
            emotion — engineered without compromise.
          </p>
        </header>

        <div className="lineup-container">
          {models.map((model) => (
            <ModelShowcaseCard
              key={model.id}
              model={model}
              navigateTo={navigateTo}
            />
          ))}
        </div>
      </section>

      {/* Engineering Pillars Bento Grid */}
      <section className="feature-section">
        <header className="first-intro">
          <h3>ENGINEERED FOR PERFECTION</h3>
          <h2>The Art of Performance</h2>
          <p>
            Every curve, detail, and system is designed to deliver an unmatched
            driving experience blending power with active aerodynamic precision.
          </p>
        </header>

        <div className="feature-grid">
          {pillars.map((pillar, idx) => (
            <div
              className={`feature-box ${idx === 0 || idx === 3 ? "feature-box--wide" : ""}`}
              key={pillar.title}
            >
              <div className="feature-box-header">
                <span className="feature-box-icon" aria-hidden="true">
                  {pillar.icon}
                </span>
                <span className="feature-box-index">0{idx + 1}</span>
              </div>
              <h3>{pillar.title}</h3>
              <p>{pillar.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Racing Heritage */}
      <section className="home-grid">
        <div className="grid-info">
          <h2>RACING IS THE CORE FOUNDATION</h2>
          <p>
            Founded by racer Bruce McLaren in 1963, our story has always been
            built on determination, lightweight composites, and high-speed
            aerodynamics.
          </p>
          <p>
            Every road car we construct today carries structural engineering
            choices derived from decades of competitive Formula One experience.
            We focus on control, speed, and weight reduction.
          </p>

          <div className="milestone-row">
            {milestones.map((m) => (
              <div className="milestone" key={m.label}>
                <span className="milestone-value">{m.value}</span>
                <span className="milestone-label">{m.label}</span>
              </div>
            ))}
          </div>

          <button
            className="btn-main outline"
            onClick={() => navigateTo("about")}
          >
            Explore Our Heritage
          </button>
        </div>
        <div className="grid-media">
          <img
            src="./cars/Bruce-Mclaren.jpg"
            alt="McLaren Legacy"
            referrerPolicy="no-referrer"
            loading="lazy"
          />
        </div>
      </section>

      {/* Airflow / Engineering Visual */}
      <section className="home-grid reverse">
        <div className="grid-info">
          <h2>MANIPULATING AIRFLOW</h2>
          <p>
            Airflow dictates our surfaces. From active rear spoilers and front
            splitters to high-exit exhaust deck vents, clean air is routed to
            cool powertrains, minimize drag, and amplify downforce.
          </p>
          <p>
            Underneath, advanced carbon fibre Monocage cells guard drivers while
            providing immense torsional rigidity for immediate cornering
            feedback.
          </p>
          <button
            className="btn-main fill"
            onClick={() => navigateTo("models")}
          >
            Browse Full Showroom →
          </button>
        </div>
        <div className="grid-media">
          <img
            src="./cars/mclaren-1.jpg"
            alt="Engineering Flow"
            referrerPolicy="no-referrer"
            loading="lazy"
          />
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials-section">
        <header className="testimonials-intro">
          <h3>WHAT THEY SAY</h3>
          <h2>Press &amp; Owners</h2>
        </header>

        <div className="testimonials-container">
          {reviews.map((review) => (
            <blockquote
              className={
                review.featured
                  ? "testimonial-card testimonial-card--featured"
                  : "testimonial-card"
              }
              key={review.name}
            >
              <div className="testimonial-quote" aria-hidden="true">
                "
              </div>
              <div className="testimonial-rating" aria-label="5 out of 5 stars">
                ★★★★★
              </div>
              <p className="testimonial-text">{review.text}</p>
              <footer className="testimonial-author">
                <img
                  className="author-avatar"
                  src={review.avatar}
                  alt={review.name}
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
                <span className="author-details">
                  <span className="author-name">{review.name}</span>
                  <span className="author-role">{review.role}</span>
                </span>
              </footer>
            </blockquote>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <header className="first-intro">
          <h3>THE EXPERIENCE</h3>
          <h2>Begin Your Journey</h2>
          <p>
            Beyond the car itself, every McLaren journey is a curated experience
            — from your first inquiry to the day it's built around you.
          </p>
        </header>

        <div className="cta-container">
          {experiences.map((exp) => (
            <button
              className="cta-card"
              key={exp.title}
              onClick={() => navigateTo(exp.target)}
            >
              {exp.title}
              <span aria-hidden="true">→</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
