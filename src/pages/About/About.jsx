import { useState, useEffect } from "react";
import "./About.css";

export default function About({ navigateTo }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function fetchAboutData() {
      try {
        setLoading(true);
        const res = await fetch("http://localhost:3000/api/about");
        if (!res.ok) {
          throw new Error("Failed to load about data from server");
        }
        const json = await res.json();
        if (mounted) {
          setData(json);
        }
      } catch (err) {
        console.error("Error fetching About page data:", err);
        if (mounted) {
          setError("Unable to load page content.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchAboutData();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="about-loading">
        <div className="loading-spinner" aria-hidden="true" />
        <span>LOADING McLAREN HERITAGE...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="about-error">
        <h2>Heritage Specs Unavailable</h2>
        <p>{error || "Could not fetch content."}</p>
      </div>
    );
  }

  const { hero, quote, founder, bannerImage, timeline, stats, philosophy } =
    data;

  return (
    <div className="about-page">
      {/* HERO */}
      <section className="ab-hero">
        <div className="ab-hero-bg" />
        <div className="ab-hero-content">
          <p className="ab-est">{hero?.est}</p>
          <h1 className="ab-hero-title">
            {hero?.title}
            <br />
            <em>{hero?.titleSub}</em>
          </h1>
        </div>
        <div className="ab-hero-scroll">{hero?.scrollText || "SCROLL"}</div>
      </section>

      {/* PULL QUOTE */}
      {quote && (
        <section className="ab-quote-section">
          <div className="ab-quote-inner">
            <span className="ab-quote-mark">"</span>
            <blockquote className="ab-quote-text">{quote.text}</blockquote>
            <cite className="ab-quote-author">{quote.author}</cite>
          </div>
        </section>
      )}

      {/* FOUNDER STORY */}
      {founder && (
        <section className="ab-founder-section">
          <div className="ab-founder-grid">
            <div className="ab-founder-image">
              <img src={founder.image} alt={founder.name} />
              <div className="ab-founder-label">
                <span>{founder.name}</span>
                <span>{founder.lifespan}</span>
              </div>
            </div>
            <div className="ab-founder-text">
              <span className="ab-tag">{founder.tag}</span>
              <h2>{founder.headline}</h2>
              {founder.paragraphs?.map((pText, idx) => (
                <p key={idx}>{pText}</p>
              ))}
              <div className="ab-founder-divider" />
              <p className="ab-founder-note">{founder.note}</p>
            </div>
          </div>
        </section>
      )}

      {/* FULL WIDTH BANNER */}
      {bannerImage && (
        <section className="ab-fullwidth-image">
          <img src={bannerImage.src} alt={bannerImage.label} />
          <div className="ab-fullwidth-overlay">
            <p className="ab-fullwidth-label">{bannerImage.label}</p>
          </div>
        </section>
      )}

      {/* TIMELINE */}
      {timeline && (
        <section className="ab-timeline-section">
          <div className="ab-timeline-header">
            <span className="ab-tag">HERITAGE</span>
            <h2>Six decades of progress.</h2>
          </div>
          <div className="ab-timeline-scroll">
            {timeline.map((item) => (
              <div className="ab-timeline-card" key={item.year}>
                <span className="ab-timeline-year">{item.year}</span>
                <div className="ab-timeline-line" />
                <p className="ab-timeline-event">{item.event}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* BIG NUMBERS */}
      {stats && (
        <section className="ab-numbers-section">
          <div className="ab-numbers-grid">
            {stats.map((stat, idx) => (
              <div className="ab-number" key={idx}>
                <span className="ab-number-val">{stat.value}</span>
                <span className="ab-number-lbl">{stat.label}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* PHILOSOPHY */}
      {philosophy && (
        <section className="ab-philosophy-section">
          <div className="ab-philosophy-inner">
            <span className="ab-tag">OUR PHILOSOPHY</span>
            <h2>Three rules. No exceptions.</h2>
            <div className="ab-philosophy-list">
              {philosophy.map((item) => (
                <div className="ab-philosophy-item" key={item.num}>
                  <span className="ab-phil-num">{item.num}</span>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="ab-cta-section">
        <h2>Ready to experience it?</h2>
        <button className="ab-cta-btn" onClick={() => navigateTo("models")}>
          Browse the Lineup →
        </button>
      </section>
    </div>
  );
}
