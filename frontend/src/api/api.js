// src/api/api.js
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:8080/api';

const api = axios.create({ baseURL: API_BASE });

// Attach token if present
api.interceptors.request.use(config => {
  const token = localStorage.getItem('pmj_token');
  if (token) config.headers['Authorization'] = `Bearer ${token}`;
  return config;
}, error => Promise.reject(error));

/* ----------- AUTH ----------- */
export async function login(email, password) {
  return api.post('/auth/login', { email, password }).then(r => r.data);
}

export async function register(name, email, password) {
  return api.post('/auth/register', { name, email, password }).then(r => r.data);
}

export async function sendEmailOtp(email) {
  console.log("📤 FRONTEND → Sending OTP request with email:", email);

  return api.post('/auth/send-email-otp', { email })
    .then(r => {
      console.log("📥 BACKEND → OTP API responded:", r.data);
      return r.data;
    })
    .catch(err => {
      console.log("❌ BACKEND ERROR →", err.response?.data || err.message);
      throw err;
    });
}


// verify endpoints use the pending token in Authorization header
export async function verifyEmailOtp(pendingToken, otp) {
  return api.post('/auth/verify-email-otp', { otp }, {
    headers: { Authorization: `Bearer ${pendingToken}` }
  }).then(r => r.data);
}

export async function verify2fa(pendingToken, code) {
  return api.post('/auth/verify-2fa', { code }, {
    headers: { Authorization: `Bearer ${pendingToken}` }
  }).then(r => r.data);
}

export async function enable2fa() {
  return api.post('/auth/enable-2fa').then(r => r.data);
}

export async function disable2fa() {
  return api.post('/auth/disable-2fa').then(r => r.data);
}

/* ----------- PROFILE (added) ----------- */
/**
 * Fetch the current user's profile using an access token.
 * If token argument is provided, it will be used; otherwise it uses stored token.
 * Expected response shape: { email, role, ... }
 */
export async function getProfile(token) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  return api.get('/user/me', { headers }).then(r => r.data);
}

/* ----------- ENQUIRIES ----------- */
export async function createEnquiry(payload) {
  // your backend used '/enquiry' in existing code; keep that
  return api.post('/enquiry', payload).then(r => r.data);
}

export async function getEnquiries() {
  return api.get('/enquiry').then(r => r.data);
}

/* ----------- SHIPMENTS ----------- */
export async function getShipments() {
  return api.get('/shipments').then(r => r.data);
}

export async function trackShipment(trackingId) {
  return api.get(`/shipments/track/${encodeURIComponent(trackingId)}`).then(r => r.data);
}

/* ----------- GUEST LOGIN ----------- */
export async function guestLogin() {
  return api.post('/auth/guest').then(r => r.data);
}

/* ----------- DEFAULT EXPORT ----------- */
export default api;
