package com.pmj.backend.service;

import com.pmj.backend.model.PasswordResetToken;
import com.pmj.backend.model.User;
import com.pmj.backend.repository.PasswordResetTokenRepository;
import com.pmj.backend.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;
import java.util.UUID;

@Service
public class PasswordResetService {

    private final PasswordResetTokenRepository tokenRepo;
    private final UserRepository userRepo;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    public PasswordResetService(
            PasswordResetTokenRepository tokenRepo,
            UserRepository userRepo,
            EmailService emailService,
            PasswordEncoder passwordEncoder
    ) {
        this.tokenRepo = tokenRepo;
        this.userRepo = userRepo;
        this.emailService = emailService;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Create a token record, send email with reset link.
     * If email not found -> silently return (no user-existence leak).
     */
    public void sendResetEmail(String email) {
        Optional<User> userOpt = userRepo.findByEmail(email);
        if (userOpt.isEmpty()) {
            return; // don't reveal whether email exists
        }

        // Remove previous tokens for this email
        tokenRepo.deleteByUserEmail(email);

        // Create token (UUID)
        String token = UUID.randomUUID().toString();
        Instant expiry = Instant.now().plus(1, ChronoUnit.HOURS);

        PasswordResetToken prt = new PasswordResetToken(token, expiry, email);
        tokenRepo.save(prt);

        // Link to frontend reset page
        String link = "http://localhost:3000/reset-password?token=" + token;

        String text = "Click the link below to reset your PMJ password:\n\n" + link +
                "\n\nThis link expires in 1 hour.";

        emailService.sendSimpleMessage(email, "PMJ Password Reset", text);
    }

    /**
     * Given a token and new password, validate token & expiry,
     * set new password (encoded) and remove token.
     */
    public boolean resetPassword(String tokenString, String newPassword) {
        Optional<PasswordResetToken> opt = tokenRepo.findByToken(tokenString);
        if (opt.isEmpty()) return false;

        PasswordResetToken token = opt.get();

        if (token.getExpiry().isBefore(Instant.now())) {
            tokenRepo.delete(token);
            return false;
        }

        Optional<User> userOpt = userRepo.findByEmail(token.getUserEmail());
        if (userOpt.isEmpty()) {
            tokenRepo.delete(token);
            return false;
        }

        User user = userOpt.get();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepo.save(user);

        tokenRepo.delete(token);
        return true;
    }
}
