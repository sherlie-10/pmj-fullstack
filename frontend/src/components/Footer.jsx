import React from "react";
import { Link } from "react-router-dom";
import '../styles/footer.css';

export default function Footer() {
  return (
    <footer className="pmj-footer">
      <div className="footer-top container">
        
        <div className="footer-col">
          <h3>PMJ Logistics Solutions</h3>
          <p>Your trusted partner for logistics, tracking & warehouse operations.</p>
          <p className="footer-small">Fast • Transparent • Reliable</p>
        </div>

        <div className="footer-col">
          <h4>Quick Links</h4>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/enquiry">Enquiry</Link></li>
            <li><Link to="/shipments">Shipments</Link></li>
            <li><Link to="/login">Login</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Contact</h4>
          <p>Email: support@pmjsolutions.com</p>
          <p>Phone: +91 9876543210</p>
          <p>Pune • Hyderabad • Bangalore</p>
        </div>

      </div>

      <div className="footer-bottom">
        © {new Date().getFullYear()} PMJ Logistics Solutions. All rights reserved.
      </div>
    </footer>
  );
}

