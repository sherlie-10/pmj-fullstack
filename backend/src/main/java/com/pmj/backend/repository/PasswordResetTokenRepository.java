package com.pmj.backend.repository;

import com.pmj.backend.model.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {

    Optional<PasswordResetToken> findByToken(String token);

    // delete all tokens for an email (useful when creating a new one)
    void deleteByUserEmail(String userEmail);
}

