import { useState } from "react";
import "./Gallery.css";

const imagesCollection = [
  {
    url: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=600&q=80",
    tag: "track",
    desc: "Monza Circuit Evaluations",
  },
  {
    url: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=600&q=80",
    tag: "exterior",
    desc: "Active spoiler profiles",
  },
  {
    url: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=600&q=80",
    tag: "interior",
    desc: "Carbon fiber seats and trim",
  },
  {
    url: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=600&q=80",
    tag: "track",
    desc: "High-speed stability testing",
  },
  {
    url: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=600&q=80",
    tag: "exterior",
    desc: "Rear deck exhaust exits",
  },
  {
    url: "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=600&q=80",
    tag: "interior",
    desc: "Driver instrumentation panel",
  },
];

export default function Gallery() {
  const [selectedTag, setSelectedTag] = useState("all");

  const renderedMedia =
    selectedTag === "all"
      ? imagesCollection
      : imagesCollection.filter((i) => i.tag === selectedTag);

  return (
    <div className="gallery-layout">
      <div className="gallery-billboard">
        <h1>SHOWROOM GALLERY</h1>
        <p>
          Explore high-resolution media capturing our supercars in motion and in
          detail.
        </p>
      </div>

      <div className="gallery-tabs">
        <button
          className={selectedTag === "all" ? "active" : ""}
          onClick={() => setSelectedTag("all")}
        >
          All Media
        </button>
        <button
          className={selectedTag === "track" ? "active" : ""}
          onClick={() => setSelectedTag("track")}
        >
          Track Action
        </button>
        <button
          className={selectedTag === "exterior" ? "active" : ""}
          onClick={() => setSelectedTag("exterior")}
        >
          Exteriors
        </button>
        <button
          className={selectedTag === "interior" ? "active" : ""}
          onClick={() => setSelectedTag("interior")}
        >
          Cabin Interiors
        </button>
      </div>

      <div className="gallery-grid">
        {renderedMedia.map((img, idx) => (
          <div className="gallery-media-card" key={idx}>
            <img src={img.url} alt={img.desc} />
            <div className="gallery-card-label">
              <span>{img.desc}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
