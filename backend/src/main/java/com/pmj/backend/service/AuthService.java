package com.pmj.backend.service;

import com.pmj.backend.model.User;
import com.pmj.backend.repository.UserRepository;
import com.pmj.backend.dto.AuthResponse;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.pmj.backend.security.JwtUtil;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    public AuthResponse register(String name, String email, String rawPassword, String role) {
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email already exists");
        }

        // Use the plain constructor (no Lombok builder required)
        User u = new User(name, email, passwordEncoder.encode(rawPassword), role);
        userRepository.save(u);

        String token = jwtUtil.generateToken(email);
        return new AuthResponse(token);
    }

    /**
     * Performs login; if user has twoFaEnabled returns null token and caller should ask for MFA.
     * If not enabled returns AuthResponse with token.
     */
    public AuthResponse login(String email, String rawPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        if (!passwordEncoder.matches(rawPassword, user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        if (user.isTwoFaEnabled()) {
            // caller will handle pending token flow
            return null;
        }

        String token = jwtUtil.generateToken(email);
        return new AuthResponse(token);
    }
}
