import "./Home.css";
import "./ModelSpotLight.css";

/* ---------------- Data ---------------- */

const STATS = [
  { value: "212", suffix: " MPH", label: "Top Speed" },
  { value: "2.8", suffix: " Sec", label: "0-100 km/h" },
  { value: "740", suffix: " PS", label: "Twin Turbo V8" },
  { value: "Carbon Fibre", suffix: "", label: "Monocage II" },
];

// Replace the MODELS data with simpler version
const MODELS = [
  {
    id: "mclaren-720s",
    name: "720S Spider",
    series: "Super Series",
    price: "$315,000",
    image: "./cars/mclaren-1.jpg",
  },
  {
    id: "mclaren-artura",
    name: "Artura",
    series: "High-Performance Hybrid",
    price: "$237,500",
    image: "./cars/mclaren-2.jpg",
  },
  {
    id: "mclaren-750s",
    name: "750S Spider",
    series: "Super Series",
    price: "$337,195",
    image: "./cars/mclaren-3.jpeg",
  },
  {
    id: "mclaren-w1",
    name: "W1 Hypercar",
    series: "Ultimate Series",
    price: "$2,100,000",
    image: "./cars/W1-hypercar.webp",
  },
];

const PILLARS = [
  {
    icon: "◈",
    title: "Carbon Fibre Architecture",
    text: "Ultra-lightweight Monocage chassis inspired by Formula One technology.",
  },
  {
    icon: "⚡",
    title: "Twin-Turbocharged V8",
    text: "Built for relentless acceleration and uncompromising performance.",
  },
  {
    icon: "◎",
    title: "Aerodynamic Intelligence",
    text: "Active aerodynamics continuously optimize downforce and stability.",
  },
  {
    icon: "◐",
    title: "Driver-Centric Cockpit",
    text: "Luxury craftsmanship focused entirely around the driver.",
  },
  {
    icon: "◇",
    title: "Onboard Telemetry",
    text: "Real-time data systems that let drivers analyze and improve every lap.",
  },
  {
    icon: "◑",
    title: "Driver Assistance",
    text: "Technology that supports the driver without ever taking control away.",
  },
];

const MILESTONES = [
  { value: "1963", label: "Year Founded" },
  { value: "15+", label: "Road Car Models" },
  { value: "190+", label: "Formula One Victories" },
  { value: "9", label: "Constructors Championships" },
];

const REVIEWS = [
  {
    text: "The 720S is not just a supercar — it's the most complete driving machine I've ever experienced. Nothing else competes at this level.",
    name: "Chris Harris",
    role: "Top Gear, BBC",
    avatar: "./cars/mclaren-1.jpg",
    featured: false,
  },
  {
    text: "Owning a McLaren is a statement. Every drive feels like the car was built specifically for you — it reads your inputs and responds with pure, unfiltered emotion.",
    name: "James W.",
    role: "McLaren Owner, Dubai",
    avatar: "./cars/mclaren-3.jpeg",
    featured: true,
  },
  {
    text: "Supercar of the Year. McLaren's engineering philosophy is unmatched — surgical precision at every speed, every corner.",
    name: "Evo Magazine",
    role: "Car of the Year",
    avatar: "./cars/mclaren-12.jpg",
    featured: false,
  },
];

const EXPERIENCES = [
  { title: "Browse All Models", target: "models" },
  { title: "About McLaren", target: "about" },
  { title: "Contact Us", target: "contact" },
  { title: "Log In to Your Account", target: "login" },
];

/* ---------------- Unified Model Card ---------------- */

// Replace UnifiedModelCard component with this:

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
          {STATS.map((stat, i) => (
            <div className="stat-card" key={stat.label}>
              <div className="stat-value">
                {stat.value}
                <span className="stat-suffix">{stat.suffix}</span>
              </div>
              <div className="stat-label">{stat.label}</div>
              {i < STATS.length - 1 && (
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
          {MODELS.map((model) => (
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
          {PILLARS.map((pillar, idx) => (
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
            {MILESTONES.map((m) => (
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
          {REVIEWS.map((review) => (
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
          {EXPERIENCES.map((exp) => (
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
