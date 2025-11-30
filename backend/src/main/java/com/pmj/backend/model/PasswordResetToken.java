package com.pmj.backend.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "password_reset_tokens", indexes = {
        @Index(name = "idx_token", columnList = "token")
})
public class PasswordResetToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // random token string used in reset link
    @Column(nullable = false, unique = true)
    private String token;

    // email of the user who requested reset (no FK required)
    @Column(nullable = false)
    private String userEmail;

    // expiry instant
    @Column(nullable = false)
    private Instant expiry;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    public PasswordResetToken() {}

    // convenience constructor: generate token externally and pass expiry
    public PasswordResetToken(String token, Instant expiry, String userEmail) {
        this.token = token;
        this.expiry = expiry;
        this.userEmail = userEmail;
        this.createdAt = Instant.now();
    }

    // getters / setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }

    public Instant getExpiry() { return expiry; }
    public void setExpiry(Instant expiry) { this.expiry = expiry; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
