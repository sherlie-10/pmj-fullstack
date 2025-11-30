

// src/components/Services.jsx
import React from "react";
import "../styles/forms.css";      // keep any shared form styles you need
import "../styles/services.css";   // <-- correct relative path (was ./styles/services.css)

const services = [
  { title: "Track Packages", desc: "Real-time status updates and full history", img: "/images/service-1.jpg" },
  { title: "Manage Enquiries", desc: "Fast response management for customers", img: "/images/service-2.jpg" },
  { title: "Warehouse Ops", desc: "Inventory & shipment coordination", img: "/images/service-3.jpg" },
];

export default function Services() {
  return (
    <section className="services-wrap">
      <div className="container">
        <div className="section-title" style={{ marginBottom: 12 }}>Our Services</div>

        <div className="services-grid">
          {services.map((s, i) => (
            <article key={i} className="service-card card">
              <div className="service-media">
                <img src={s.img} alt={s.title} />
              </div>

              <div style={{ marginTop: 12 }}>
                <h3 style={{ margin: 0, fontSize: 18 }}>{s.title}</h3>
                <p style={{ marginTop: 8, color: "var(--muted)" }}>{s.desc}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
