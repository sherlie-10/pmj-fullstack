// src/auth.js
import React, { createContext, useContext, useEffect, useState } from "react";
import * as api from "./api/api";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("pmj_token"));
  const [userEmail, setUserEmail] = useState(() => localStorage.getItem("pmj_email"));
  const [role, setRole] = useState(() => localStorage.getItem("pmj_role"));

  // persist token/email/role
  useEffect(() => {
    if (token) localStorage.setItem("pmj_token", token);
    else localStorage.removeItem("pmj_token");
  }, [token]);

  useEffect(() => {
    if (userEmail) localStorage.setItem("pmj_email", userEmail);
    else localStorage.removeItem("pmj_email");
  }, [userEmail]);

  useEffect(() => {
    if (role) localStorage.setItem("pmj_role", role);
    else localStorage.removeItem("pmj_role");
  }, [role]);

  // CLEAN STALE ROLE – if token is missing but role exists, clear it
  useEffect(() => {
    if (!localStorage.getItem("pmj_token") && localStorage.getItem("pmj_role")) {
      localStorage.removeItem("pmj_role");
      setRole(null);
    }
  }, []);

  // Optional: verify token on startup (uncomment if backend supports /user/me)
  // useEffect(() => {
  //   async function verify() {
  //     const t = localStorage.getItem('pmj_token');
  //     if (!t) return;
  //     try {
  //       const profile = await api.getProfile(t);
  //       setRole(profile.role || 'USER');
  //       setUserEmail(profile.email || localStorage.getItem('pmj_email'));
  //     } catch (e) {
  //       setToken(null); setRole(null); setUserEmail(null);
  //       localStorage.removeItem('pmj_token'); localStorage.removeItem('pmj_role');
  //     }
  //   }
  //   verify();
  // }, []);

  function logout() {
    setToken(null);
    setUserEmail(null);
    setRole(null);
    // also remove storage proactively
    localStorage.removeItem("pmj_token");
    localStorage.removeItem("pmj_email");
    localStorage.removeItem("pmj_role");
  }

  return (
    <AuthContext.Provider
      value={{ token, setToken, userEmail, setUserEmail, role, setRole, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}
