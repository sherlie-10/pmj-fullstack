
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./auth";

/* Components */
import Header from "./components/Header";
import Footer from "./components/Footer";
import Hero from "./components/Hero";
import Services from "./components/Services";
import Testimonials from "./components/Testimonials";
import ShipmentsPage from "./components/shipments/ShipmentsPage";
import AdminDashboard from "./components/admin/AdminDashboard";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";

import Login from "./components/Login";
import Register from "./components/Register";
import EnquiryForm from "./components/EnquiryForm";
import EnquiryList from "./components/EnquiryList";
import Track from "./components/Track";

/* Global / split styles — load variables + base first, then per-area sheets */
import "./styles/_variables.css";
import "./styles/base.css";
import "./styles/header.css";
import "./styles/hero.css";
import "./styles/forms.css";
import "./styles/buttons.css";
import "./styles/footer.css";
import "./styles/testimonials.css";
import "./styles/shipments.css";
import "./styles/table.css";
import "./styles/services.css";
import "./styles/track.css";


export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Header />
        <main className="container" style={{ paddingTop: 8 }}>
          <Routes>
            <Route path="/" element={<><Hero /><Services /><Testimonials /></>} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />     

            <Route path="/enquiry" element={<><EnquiryForm /><EnquiryList /></>} />
            <Route path="/track" element={<Track />} />
            <Route path="/shipments" element={<ShipmentsPage />} />
            <Route path="/admin" element={<AdminDashboard />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </Router>
    </AuthProvider>
  );
}
