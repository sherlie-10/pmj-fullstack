import React from "react";
import '../styles/testimonials.css';


export default function Testimonials() {

  const reviews = [
    {
      name: "Rahul Verma",
      position: "Operations Manager, NeFab India",
      feedback: `PMJ Solutions has transformed the way we track our shipments.
      Earlier, our team had delays because updates were scattered across emails and WhatsApp.
      With PMJ’s live tracking and transparent timeline, our dispatch team runs smoother than ever.`,
      rating: 5,
    },
    {
      name: "Sneha Kulkarni",
      position: "Logistics Coordinator, MetroSupply",
      feedback: `The enquiry management panel is clean and intuitive.
      Our customer support team resolves customer requests 30% faster since switching to PMJ.
      The automated email notifications are a blessing for bulk shipments.`,
      rating: 5,
    },
    {
      name: "Arjun Rao",
      position: "Fleet Supervisor, BrightTrans Logistics",
      feedback: `We handle around 150+ daily shipments across South India.
      PMJ’s secure admin portal and real-time updates help us avoid delays and misrouting.
      One of the most reliable tools we’ve used — lightweight and fast.`,
      rating: 4,
    },
  ];

  return (
    <section className="testimonials">
      <h2 className="section-title">Client Testimonials</h2>

      <div className="testimonials-grid">
        {reviews.map((r, i) => (
          <div key={i} className="testimonial">
            <h3>{r.name}</h3>
            <p className="position">{r.position}</p>
            <p className="feedback">“{r.feedback}”</p>

            <div className="stars">
              {"⭐".repeat(r.rating)}
              {"☆".repeat(5 - r.rating)}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
