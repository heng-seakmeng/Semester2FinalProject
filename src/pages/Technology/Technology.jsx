import "./Technology.css";

export default function Technology() {
  return (
    <div className="technology-layout">
      <div className="tech-billboard">
        <h1>INNOVATION & TECHNOLOGY</h1>
        <p>
          Explore our engineering advancements: high-voltage axial hybrid
          drives, active aerodynamics, and on-board digital telemetry.
        </p>
      </div>

      <div className="tech-grid-cards">
        <section className="tech-card-item">
          <h2>ELECTRIFIED PROPULSION</h2>
          <p>
            By placing high-density lithium batteries and axial-flux e-motors
            directly inside our dual-clutch transmission frames, our
            high-performance hybrid setups achieve immediate, linear throttle
            responses.
          </p>
          <p>
            This electric torque output helps fill combustion engine lag gaps,
            creating linear throttle response parameters under all gear
            settings.
          </p>
        </section>

        <section className="tech-card-item">
          <h2>ACTIVE AIRFLOW MANAGEMENT</h2>
          <p>
            Aerodynamic surfaces analyze vehicle velocity, steering changes, and
            throttle positions. Front downforce ducts and active rear wings
            adjust automatically to reduce air drag on straightaways and
            maximize downforce in corners.
          </p>
        </section>

        <section className="tech-card-item">
          <h2>DIGITAL LAP TELEMETRY</h2>
          <p>
            Our dynamic telemetry platform serves as your track coach. It
            measures lateral forces, apex entries, and throttle percentages,
            saving your data to help map and analyze lap progress over circuit
            routes.
          </p>
        </section>
      </div>
    </div>
  );
}
