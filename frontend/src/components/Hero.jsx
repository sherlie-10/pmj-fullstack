import React from 'react';
import '../styles/hero.css';


export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-inner container">
        <div className="hero-left">
          <h1>Fast. Transparent. Reliable Logistics.</h1>
          <p className="lead">Track shipments in real-time, manage enquiries, and keep stakeholders informed — built for operators and customers alike.</p>
          <div style={{display:'flex', gap:12, marginTop:18}}>
            <a href="/enquiry" className="btn">Create Enquiry</a>
            <a href="/track" className="btn ghost">Track a Package</a>
          </div>
        </div>

        <div className="hero-right">
          <div className="hero-image-wrap">
            <img alt="hero" src="/images/hero.jpg" />
          </div>
        </div>
      </div>
    </section>
  );
}
