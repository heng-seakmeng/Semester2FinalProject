import "./Performance.css";

export default function Performance() {
  return (
    <div className="performance-view">
      <div className="perf-billboard">
        <h1>PERFORMANCE DESIGN</h1>
        <p>
          Explore the composite materials, airflow management, and linked active
          suspension setups that establish the foundations of McLaren dynamics.
        </p>
      </div>

      <div className="perf-narrative-rows">
        <section className="perf-narrative-row">
          <div className="narrative-text">
            <h2>LIGHTWEIGHT ENGINEERING</h2>
            <p>
              Weight is the absolute enemy of high-performance driving. From our
              earliest days, McLaren has pioneered the usage of composite carbon
              fiber architectures on track. Our modern Monocage structure
              creates a strong survival cell while minimizing weight.
            </p>
            <p>
              Reducing unneeded weight helps maximize performance, contributing
              directly to handling agility, short stopping distances, and faster
              acceleration speeds.
            </p>
          </div>
          <div className="narrative-media">
            <img
              src="https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80"
              alt="Composite Details"
            />
          </div>
        </section>

        <section className="perf-narrative-row alternate">
          <div className="narrative-text">
            <h2>HYDRAULIC ACTIVE SUSPENSION</h2>
            <p>
              Our Proactive Chassis Control system replaces heavy, solid
              anti-roll bars with dynamic hydraulic pressure systems.
              Interconnected dampers adjust pressure boundaries in real-time,
              matching dynamic inputs.
            </p>
            <p>
              When turning hard, corner hydraulic pressure is increased to keep
              the body level. Over straight highway surfaces, fluid flows freely
              to reduce impact harshness, delivering grand touring ride comfort.
            </p>
          </div>
          <div className="narrative-media">
            <img
              src="https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=1200&q=80"
              alt="Chassis Suspensions"
            />
          </div>
        </section>
      </div>
    </div>
  );
}
