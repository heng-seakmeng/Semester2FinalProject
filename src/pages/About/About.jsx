import "./About.css";

const TIMELINE = [
  {
    year: "1963",
    event: "Bruce McLaren founds Bruce McLaren Motor Racing in New Zealand.",
  },
  {
    year: "1966",
    event: "McLaren enters Formula One as a constructor for the first time.",
  },
  {
    year: "1974",
    event:
      "Emerson Fittipaldi wins McLaren's first F1 Constructors' Championship.",
  },
  {
    year: "1981",
    event: "MP4/1 becomes the first F1 car with a full carbon fibre monocoque.",
  },
  {
    year: "1988",
    event: "Ayrton Senna and Alain Prost dominate — 15 wins from 16 races.",
  },
  {
    year: "1992",
    event:
      "The McLaren F1 road car debuts — the greatest driver's car ever made.",
  },
  {
    year: "2011",
    event: "MP4-12C launches modern McLaren road car era from Woking.",
  },
  {
    year: "2024",
    event:
      "W1 hypercar unveiled — successor to the F1 with ground-effect aero.",
  },
];

export default function About({ navigateTo }) {
  return (
    <div className="about-page">
      {/* HERO */}
      <section className="ab-hero">
        <div className="ab-hero-bg" />
        <div className="ab-hero-content">
          <p className="ab-est">EST. 1963 — WOKING, SURREY</p>
          <h1 className="ab-hero-title">
            The Pursuit
            <br />
            <em>Never Ends.</em>
          </h1>
        </div>
        <div className="ab-hero-scroll">SCROLL</div>
      </section>

      {/* PULL QUOTE */}
      <section className="ab-quote-section">
        <div className="ab-quote-inner">
          <span className="ab-quote-mark">"</span>
          <blockquote className="ab-quote-text">
            You have to go and find the limit — and then a little bit further.
          </blockquote>
          <cite className="ab-quote-author">— Bruce McLaren, 1963</cite>
        </div>
      </section>

      {/* FOUNDER STORY */}
      <section className="ab-founder-section">
        <div className="ab-founder-grid">
          <div className="ab-founder-image">
            <img src="./cars/Bruce-Mclaren.jpg" alt="Bruce McLaren" />
            <div className="ab-founder-label">
              <span>Bruce McLaren</span>
              <span>1937 — 1970</span>
            </div>
          </div>
          <div className="ab-founder-text">
            <span className="ab-tag">THE FOUNDER</span>
            <h2>A driver who built his own future.</h2>
            <p>
              Bruce McLaren was 22 years old when he won the United States Grand
              Prix in 1959 — the youngest Formula One race winner in history at
              the time. But winning wasn't enough. He wanted to build the car
              himself.
            </p>
            <p>
              In 1963, working from a small workshop in Feltham, Middlesex, he
              started what would become one of the most decorated names in
              motorsport. His philosophy was simple and uncompromising: a
              lighter car is a faster car. That belief became the foundation of
              everything McLaren has ever built.
            </p>
            <p>
              Bruce died in a testing accident at Goodwood in June 1970, aged
              32. The team he created went on to win 8 Constructors'
              Championships, 12 Drivers' Championships, and produce some of the
              most revered road cars ever made.
            </p>
            <div className="ab-founder-divider" />
            <p className="ab-founder-note">
              Every McLaren built today carries a small plaque bearing his name.
            </p>
          </div>
        </div>
      </section>

      {/* FULL WIDTH IMAGE */}
      <section className="ab-fullwidth-image">
        <img src="./cars/mclaren-4.jpeg" alt="McLaren on track" />
        <div className="ab-fullwidth-overlay">
          <p className="ab-fullwidth-label">
            McLaren Technology Centre — Woking, Surrey
          </p>
        </div>
      </section>

      {/* TIMELINE */}
      <section className="ab-timeline-section">
        <div className="ab-timeline-header">
          <span className="ab-tag">HERITAGE</span>
          <h2>Six decades of progress.</h2>
        </div>
        <div className="ab-timeline-scroll">
          {TIMELINE.map((item) => (
            <div className="ab-timeline-card" key={item.year}>
              <span className="ab-timeline-year">{item.year}</span>
              <div className="ab-timeline-line" />
              <p className="ab-timeline-event">{item.event}</p>
            </div>
          ))}
        </div>
      </section>

      {/* BIG NUMBERS */}
      <section className="ab-numbers-section">
        <div className="ab-numbers-grid">
          <div className="ab-number">
            <span className="ab-number-val">1963</span>
            <span className="ab-number-lbl">Year Founded</span>
          </div>
          <div className="ab-number">
            <span className="ab-number-val">190+</span>
            <span className="ab-number-lbl">Formula One Wins</span>
          </div>
          <div className="ab-number">
            <span className="ab-number-val">9</span>
            <span className="ab-number-lbl">Constructors' Titles</span>
          </div>
          <div className="ab-number">
            <span className="ab-number-val">15+</span>
            <span className="ab-number-lbl">Road Car Models</span>
          </div>
        </div>
      </section>

      {/* PHILOSOPHY */}
      <section className="ab-philosophy-section">
        <div className="ab-philosophy-inner">
          <span className="ab-tag">OUR PHILOSOPHY</span>
          <h2>Three rules. No exceptions.</h2>
          <div className="ab-philosophy-list">
            <div className="ab-philosophy-item">
              <span className="ab-phil-num">01</span>
              <div>
                <h3>Lighter is faster.</h3>
                <p>
                  Carbon fibre is not a luxury — it is the only logical choice
                  for a car that must be both safe and swift. Every gram removed
                  is a gram that never has to be accelerated, braked, or
                  cornered.
                </p>
              </div>
            </div>
            <div className="ab-philosophy-item">
              <span className="ab-phil-num">02</span>
              <div>
                <h3>The driver decides.</h3>
                <p>
                  Technology exists to extend the driver's ability, never to
                  replace it. Our systems read inputs and respond — they do not
                  intervene, override, or second-guess the person behind the
                  wheel.
                </p>
              </div>
            </div>
            <div className="ab-philosophy-item">
              <span className="ab-phil-num">03</span>
              <div>
                <h3>Nothing is enough.</h3>
                <p>
                  Bruce McLaren once said you have to find the limit — and then
                  go a little further. That pursuit has never stopped. Every new
                  McLaren is a reaction to everything that came before it.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

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
