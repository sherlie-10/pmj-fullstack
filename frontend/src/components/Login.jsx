import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MdLogin } from "react-icons/md";
import * as api from "../api/api";
import { useAuth } from "../auth";

export default function Login() {
  const auth = useAuth();
  const nav = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  // MFA state
  const [pendingToken, setPendingToken] = useState(null);
  const [mfaType, setMfaType] = useState(null);
  const [mfaCode, setMfaCode] = useState("");

  // resend cooldown (seconds)
  const RESEND_COOLDOWN = 30;
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    let t;
    if (cooldown > 0) {
      t = setTimeout(() => setCooldown(cooldown - 1), 1000);
    }
    return () => clearTimeout(t);
  }, [cooldown]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    try {
      console.log("Sending login:", { email, password });

      const res = await api.login(email, password);

      console.log("Login response:", res);

      if (res.mfaRequired) {
        setPendingToken(res.pendingToken);
        setMfaType(res.mfaType || "EMAIL");
        setMfaCode("");
        setCooldown(RESEND_COOLDOWN);
        return;
      }

      // Normal flow without MFA
      const token = res.token;
      const emailResp = res.email || email;
      let roleResp = res.role;

      if (!roleResp && typeof api.getProfile === "function" && token) {
        try {
          const profile = await api.getProfile(token);
          roleResp = profile?.role || "USER";
        } catch (pfErr) {
          console.warn("profile fetch failed after login:", pfErr);
          roleResp = "USER";
        }
      } else if (!roleResp) {
        roleResp = "USER";
      }

      auth.setToken(token);
      auth.setUserEmail(emailResp);
      auth.setRole(roleResp);

      localStorage.setItem("pmj_token", token);
      localStorage.setItem("pmj_email", emailResp);
      localStorage.setItem("pmj_role", roleResp);

      roleResp === "ADMIN" ? nav("/admin") : nav("/");

    } catch (err) {
      console.log("Login error:", err);
      setError(err.response?.data?.error || err.message || "Login failed");
    }
  }

  async function handleVerifyMfa() {
    setError(null);
    try {
      let final;

      if (mfaType === "EMAIL") {
        final = await api.verifyEmailOtp(pendingToken, mfaCode);
      } else {
        final = await api.verify2fa(pendingToken, mfaCode);
      }

      console.log("MFA verify response:", final);

      if (final?.token) {
        const token = final.token;
        const emailResp = final.email || email;
        let roleResp = final.role;

        // fallback: try fetch profile if role missing
        if (!roleResp && typeof api.getProfile === "function" && token) {
          try {
            const profile = await api.getProfile(token);
            roleResp = profile?.role || "USER";
            if (profile.email) auth.setUserEmail(profile.email);
          } catch (pfErr) {
            console.warn("profile fetch failed", pfErr);
            roleResp = "USER";
          }
        } else if (!roleResp) {
          roleResp = "USER";
        }

        auth.setToken(token);
        auth.setUserEmail(emailResp);
        auth.setRole(roleResp);

        try {
          localStorage.setItem("pmj_token", token);
          localStorage.setItem("pmj_email", emailResp);
          localStorage.setItem("pmj_role", roleResp);
        } catch (err) {
          console.warn("localStorage write failed", err);
        }

        setPendingToken(null);
        setMfaCode("");
        setMfaType(null);

        const currentRole = roleResp || auth.role || localStorage.getItem("pmj_role");
        if (currentRole === "ADMIN") nav("/admin");
        else nav("/");
      } else {
        setError("Verification failed: no token returned");
      }
    } catch (err) {
      console.log("MFA verify error:", err);
      setError(err?.response?.data?.error || err?.message || "Verification failed");
    }
  }

  async function handleResendOtp() {
    setError(null);
    if (!email) {
      setError("Enter your email and press Login to request an OTP.");
      return;
    }

    try {
      // Use API's sendEmailOtp endpoint — some APIs expect the email or the pendingToken.
      // We'll try both patterns gracefully.
      setCooldown(RESEND_COOLDOWN);

      if (pendingToken && typeof api.sendEmailOtp === "function") {
        // if API supports resending with pendingToken
        await api.sendEmailOtp({ pendingToken });
      } else if (typeof api.sendEmailOtp === "function") {
        await api.sendEmailOtp({ email });
      } else {
        // fallback: call login again to trigger a new OTP
        await api.login(email, password);
      }

      // give a friendly toast-like message (console for now)
      console.log("Resend OTP requested");
    } catch (err) {
      console.warn("Resend OTP failed", err);
      setError(err?.response?.data?.error || err?.message || "Resend failed");
      // if resend failed, allow retry quicker
      setCooldown(5);
    }
  }

  return (
    <div className="card" style={{ maxWidth: 640, margin: "24px auto" }}>
      <h2>Login</h2>

      <form onSubmit={handleSubmit} className="form">
        <label>
          Email
          <input
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>

        <label>
          Password
          <input
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>

        <div style={{ marginTop: 8 }}>
          <Link to="/forgot-password">Forgot password?</Link>
        </div>

        <button className="btn" type="submit" style={{ marginTop: 12 }}>
          <MdLogin style={{ marginRight: 8, fontSize: "20px" }} />
          Login
        </button>
      </form>

      <div style={{ marginTop: 8 }}>
        New here? <Link to="/register">Create an account</Link>
      </div>

      {pendingToken && (
        <div className="card" style={{ marginTop: 12 }}>
          <h3>Enter {mfaType === "EMAIL" ? "Email OTP" : "Authenticator Code"}</h3>

          <input
            value={mfaCode}
            onChange={(e) => setMfaCode(e.target.value)}
            placeholder={mfaType === "EMAIL" ? "123456" : "Authenticator code"}
          />

          <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 8 }}>
            <button className="btn" onClick={handleVerifyMfa}>
              Verify
            </button>

            <button
              className="btn"
              onClick={(ev) => { ev.preventDefault(); handleResendOtp(); }}
              disabled={cooldown > 0}
            >
              {cooldown > 0 ? `Resend OTP (${cooldown}s)` : "Resend OTP"}
            </button>
          </div>

          <div style={{ marginTop: 8 }}>
            <small>If you didn't receive the code, request a new OTP. Check your spam/junk folder.</small>
          </div>
        </div>
      )}

      {error && <div className="error" style={{ marginTop: 12 }}>{error}</div>}
    </div>
  );
}
