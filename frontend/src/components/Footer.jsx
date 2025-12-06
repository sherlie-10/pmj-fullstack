import React from "react";
import { Link } from "react-router-dom";
import '../styles/footer.css';

export default function Footer() {
  const logClick = (e, route) => {
    console.log('Footer link clicked ->', route, 'target:', e.target);
  };

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
            <li><Link to="/" onClick={(e)=>logClick(e, '/')} >Home</Link></li>
            <li><Link to="/enquiry" onClick={(e)=>logClick(e, '/enquiry')}>Enquiry</Link></li>
            <li><Link to="/shipments" onClick={(e)=>logClick(e, '/shipments')}>Shipments</Link></li>
            <li><Link to="/login" onClick={(e)=>logClick(e, '/login')}>Login</Link></li>
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
