import React, { createContext, useContext, useEffect, useState } from "react";
// eslint-disable-next-line no-unused-vars
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

  function logout() {
    setToken(null);
    setUserEmail(null);
    setRole(null);

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
