package com.pmj.backend.model;
import lombok.*;
import jakarta.persistence.*;
import java.time.Instant;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // -------- BASIC INFO --------
    @Column(nullable = false)
    private String name;

    @Column(unique = true)
    private String email;

    @JsonIgnore
    private String password;

    // ADMIN / USER / STAFF
    private String role;

    // -------- GUEST LOGIN SUPPORT --------
    @Column(unique = true)
    private String uuid;

    private boolean isGuest = false;

    // -------- 2FA / OTP --------
    private boolean twoFaEnabled;

    @JsonIgnore
    private String twoFaSecret;

    @JsonIgnore
    private String emailOtp;

    private Instant emailOtpExpiry;

    @JsonIgnore
    private String resetToken;

    private Instant resetTokenExpiry;

    private Instant createdAt;
    private Instant updatedAt;

    public User() {}

    public User(String name, String email, String password, String role) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.role = role;
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    // -------- GETTERS & SETTERS --------

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    // guest UUID
    public String getUuid() { return uuid; }
    public void setUuid(String uuid) { this.uuid = uuid; }

    public boolean getIsGuest() { return isGuest; }
    public void setIsGuest(boolean isGuest) { this.isGuest = isGuest; }

    // 2FA
    public boolean isTwoFaEnabled() { return twoFaEnabled; }
    public void setTwoFaEnabled(boolean twoFaEnabled) { this.twoFaEnabled = twoFaEnabled; }

    public String getTwoFaSecret() { return twoFaSecret; }
    public void setTwoFaSecret(String twoFaSecret) { this.twoFaSecret = twoFaSecret; }

    // email OTP
    public String getEmailOtp() { return emailOtp; }
    public void setEmailOtp(String emailOtp) { this.emailOtp = emailOtp; }

    public Instant getEmailOtpExpiry() { return emailOtpExpiry; }
    public void setEmailOtpExpiry(Instant emailOtpExpiry) { this.emailOtpExpiry = emailOtpExpiry; }

    // reset token
    public String getResetToken() { return resetToken; }
    public void setResetToken(String resetToken) { this.resetToken = resetToken; }

    public Instant getResetTokenExpiry() { return resetTokenExpiry; }
    public void setResetTokenExpiry(Instant resetTokenExpiry) { this.resetTokenExpiry = resetTokenExpiry; }

    // timestamps
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }
}
