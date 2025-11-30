package com.pmj.backend.controller;

import com.pmj.backend.dto.AuthRequest;
import com.pmj.backend.dto.AuthResponse;
import com.pmj.backend.dto.RegisterRequest;
import com.pmj.backend.model.User;
import com.pmj.backend.repository.UserRepository;
import com.pmj.backend.security.JwtUtil;
import com.pmj.backend.service.AuthService;
import com.pmj.backend.service.EmailService;
import com.pmj.backend.service.PasswordResetService;
import com.warrenstrange.googleauth.GoogleAuthenticator;
import com.warrenstrange.googleauth.GoogleAuthenticatorKey;
import com.warrenstrange.googleauth.GoogleAuthenticatorQRGenerator;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.security.Principal;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.Random;
import java.util.Objects;

/**
 * Updated AuthController:
 * - Final tokens generated with jwtUtil.generateToken(userId, role, uuid)
 *   so tokens contain the role claim and frontend can detect ADMIN.
 * - verify2fa and verify-email-otp return JSON with token, role, email.
 * - send-email-otp/login flows unchanged except final token generation.
 *
 * Paste this file replacing your existing AuthController.java and restart.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    private final PasswordResetService passwordResetService;

    public AuthController(AuthService authService,
                          UserRepository userRepository,
                          JwtUtil jwtUtil,
                          EmailService emailService,
                          PasswordEncoder passwordEncoder,
                          PasswordResetService passwordResetService) {
        this.authService = authService;
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
        this.emailService = emailService;
        this.passwordEncoder = passwordEncoder;
        this.passwordResetService = passwordResetService;
    }

    // Register
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest req) {
        AuthResponse res = authService.register(req.getName(), req.getEmail(), req.getPassword(), "STAFF");
        return ResponseEntity.created(URI.create("/api/auth/register")).body(res);
    }

    // Login (ADMIN -> email OTP enforced; TOTP -> pending token; else normal)
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest req) {
        Optional<User> maybeUser = userRepository.findByEmail(req.getEmail());

        // If user exists, verify password first
        if (maybeUser.isPresent()) {
            User u = maybeUser.get();
            if (!passwordEncoder.matches(req.getPassword(), u.getPassword())) {
                return ResponseEntity.status(401).body(Map.of("error", "Invalid credentials"));
            }

            // Force ADMIN to email OTP flow
            String roleStr = Objects.toString(u.getRole(), "USER");
            if ("ADMIN".equalsIgnoreCase(roleStr)) {
                int otp = 100000 + new Random().nextInt(900000);
                String otpStr = String.valueOf(otp);
                u.setEmailOtp(otpStr);
                u.setEmailOtpExpiry(Instant.now().plusSeconds(5 * 60));
                userRepository.save(u);
                emailService.sendSimpleMessage(u.getEmail(), "PMJ Admin login code", "Your PMJ admin login code: " + otpStr);

                String pending = jwtUtil.generatePendingToken(u.getEmail());
                return ResponseEntity.ok(Map.of(
                        "mfaRequired", true,
                        "mfaType", "EMAIL",
                        "pendingToken", pending
                ));
            }

            // If TOTP enabled -> pending token for TOTP verification
            if (u.isTwoFaEnabled()) {
                String pending = jwtUtil.generatePendingToken(u.getEmail());
                return ResponseEntity.ok(Map.of(
                        "mfaRequired", true,
                        "mfaType", "TOTP",
                        "pendingToken", pending
                ));
            }
        }

        // No MFA required -> normal login using AuthService
        AuthResponse res = authService.login(req.getEmail(), req.getPassword());

        // If we have a user record, ensure final token includes role & uuid using JwtUtil
        if (maybeUser.isPresent()) {
            User u = maybeUser.get();
            String roleStr = Objects.toString(u.getRole(), "USER");
            String finalToken = jwtUtil.generateToken(u.getId(), roleStr, u.getUuid());
            return ResponseEntity.ok(Map.of(
                    "token", finalToken,
                    "email", u.getEmail(),
                    "role", roleStr
            ));
        }

        // Fallback: return what AuthService returned (legacy)
        return ResponseEntity.ok(Map.of("token", res.getToken()));
    }

    // Enable TOTP 2FA (authenticated)
    @PostMapping("/enable-2fa")
    public ResponseEntity<?> enable2fa(Principal principal) {
        if (principal == null) return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        String email = principal.getName();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));

        GoogleAuthenticator ga = new GoogleAuthenticator();
        GoogleAuthenticatorKey key = ga.createCredentials();
        String secret = key.getKey();

        user.setTwoFaSecret(secret);
        user.setTwoFaEnabled(true);
        userRepository.save(user);

        String issuer = "PMJ";
        String qrUri = GoogleAuthenticatorQRGenerator.getOtpAuthURL(issuer, user.getEmail(), key);

        Map<String, Object> body = new HashMap();
        body.put("qrUri", qrUri);
        body.put("secret", secret);
        return ResponseEntity.ok(body);
    }

    // Disable 2FA (authenticated)
    @PostMapping("/disable-2fa")
    public ResponseEntity<?> disable2fa(Principal principal) {
        if (principal == null) return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        String email = principal.getName();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));

        user.setTwoFaEnabled(false);
        user.setTwoFaSecret(null);
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("disabled", true));
    }

    // Verify TOTP (exchange pending token + code for final JWT)
    @PostMapping("/verify-2fa")
    public ResponseEntity<?> verify2fa(@RequestHeader(value = "Authorization", required = false) String pendingBearer,
                                       @RequestBody Map<String, String> body) {
        if (pendingBearer == null || !pendingBearer.startsWith("Bearer ")) {
            return ResponseEntity.badRequest().body(Map.of("error", "Missing pending token"));
        }
        String pending = pendingBearer.substring(7);
        if (!jwtUtil.isPendingToken(pending)) {
            return ResponseEntity.status(400).body(Map.of("error", "Invalid or expired pending token"));
        }

        String code = body.get("code");
        String email = jwtUtil.extractEmail(pending);
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.isTwoFaEnabled() || user.getTwoFaSecret() == null) {
            return ResponseEntity.status(400).body(Map.of("error", "2FA not enabled for user"));
        }

        GoogleAuthenticator ga = new GoogleAuthenticator();
        boolean ok;
        try {
            ok = ga.authorize(user.getTwoFaSecret(), Integer.parseInt(code));
        } catch (NumberFormatException nfe) {
            return ResponseEntity.status(400).body(Map.of("error", "Invalid code format"));
        }

        if (!ok) return ResponseEntity.status(401).body(Map.of("error", "Invalid 2FA code"));

        // Generate final token including role & uuid
        String finalToken = jwtUtil.generateToken(user.getId(), user.getRole(), user.getUuid());

        // Return token + role + email so frontend can persist role
        Map<String, Object> out = new HashMap<>();
        out.put("token", finalToken);
        out.put("role", user.getRole());
        out.put("email", user.getEmail());

        return ResponseEntity.ok(out);
    }

    // --------------------
    // Email OTP fallback
    // --------------------
    @PostMapping("/send-email-otp")
    public ResponseEntity<?> sendEmailOtp(@RequestBody Map<String,String> body) {
        String email = body.get("email");
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));

        int otp = 100000 + new Random().nextInt(900000);
        String otpStr = String.valueOf(otp);
        user.setEmailOtp(otpStr);
        user.setEmailOtpExpiry(Instant.now().plusSeconds(5 * 60));
        userRepository.save(user);

        emailService.sendSimpleMessage(user.getEmail(), "Your PMJ verification code", "Your code: " + otpStr);

        String pending = jwtUtil.generatePendingToken(user.getEmail());
        return ResponseEntity.ok(Map.of("mfaRequired", true, "mfaType", "EMAIL", "pendingToken", pending));
    }

    @PostMapping("/verify-email-otp")
    public ResponseEntity<?> verifyEmailOtp(@RequestHeader(value = "Authorization", required = false) String pendingBearer,
                                            @RequestBody Map<String,String> body) {
        if (pendingBearer == null || !pendingBearer.startsWith("Bearer ")) {
            return ResponseEntity.badRequest().body(Map.of("error", "Missing pending token"));
        }
        String pending = pendingBearer.substring(7);
        if (!jwtUtil.isPendingToken(pending)) {
            return ResponseEntity.status(400).body(Map.of("error", "Invalid or expired pending token"));
        }

        String email = jwtUtil.extractEmail(pending);
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));

        String otp = body.get("otp");
        if (user.getEmailOtp() == null ||
                !user.getEmailOtp().equals(otp) ||
                user.getEmailOtpExpiry() == null ||
                user.getEmailOtpExpiry().isBefore(Instant.now())) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid or expired OTP"));
        }

        user.setEmailOtp(null);
        user.setEmailOtpExpiry(null);
        userRepository.save(user);

        // Generate final token including role & uuid (so frontend can read role)
        String finalToken = jwtUtil.generateToken(user.getId(), user.getRole(), user.getUuid());

        Map<String, Object> out = new HashMap<>();
        out.put("token", finalToken);
        out.put("role", user.getRole());
        out.put("email", user.getEmail());

        return ResponseEntity.ok(out);
    }

    // --------------------
    // Password reset (forgot/reset)
    // --------------------

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String,String> body) {
        String email = body.get("email");
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "email is required"));
        }

        // Use PasswordResetService (silently handles non-existent email)
        passwordResetService.sendResetEmail(email);

        return ResponseEntity.ok(Map.of("message", "If that email exists, password reset instructions have been sent."));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String,String> body) {
        String token = body.get("token");
        String password = body.get("password");

        if (token == null || token.isBlank() || password == null || password.length() < 6) {
            return ResponseEntity.badRequest().body(Map.of("error", "token and password (>=6) required"));
        }

        boolean ok = passwordResetService.resetPassword(token, password);
        if (!ok) {
            return ResponseEntity.status(400).body(Map.of("error", "Token invalid or expired"));
        }

        return ResponseEntity.ok(Map.of("message", "Password reset successful"));
    }
}
