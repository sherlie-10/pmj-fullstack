package com.pmj.backend.controller;

import java.util.Optional;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.pmj.backend.model.User;
import com.pmj.backend.repository.UserRepository;
import com.pmj.backend.security.JwtUtil;

@RestController
@RequestMapping("/api/auth")
public class GuestAuthController {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    public GuestAuthController(UserRepository userRepository, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/guest")
    public ResponseEntity<?> createGuest() {

        String uuid = "guest-" + UUID.randomUUID().toString().replace("-", "").substring(0, 12);

        Optional<User> existing = userRepository.findByUuid(uuid);
        if (existing.isPresent()) {
            uuid = "guest-" + UUID.randomUUID().toString().replace("-", "").substring(0, 12);
        }

        User guest = new User();
        guest.setUuid(uuid);
        guest.setName("Guest");
        guest.setEmail(null);
        guest.setPassword(null);
        guest.setRole("USER");
        guest.setIsGuest(true);

        User saved = userRepository.save(guest);

        String token = jwtUtil.generateToken(saved.getId(), saved.getRole(), saved.getUuid());

        return ResponseEntity.ok(new GuestResponse(token, saved.getRole()));
    }

    public static class GuestResponse {
        public String token;
        public String role;

        public GuestResponse(String token, String role) {
            this.token = token;
            this.role = role;
        }
    }
}
