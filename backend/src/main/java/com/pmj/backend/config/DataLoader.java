package com.pmj.backend.config;

import com.pmj.backend.model.Shipment;
import com.pmj.backend.model.User;
import com.pmj.backend.repository.ShipmentRepository;
import com.pmj.backend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;

/**
 * DataLoader - idempotent seeder with upsert-by-trackingId behaviour.
 */
@Configuration
public class DataLoader {

    @Bean
    CommandLineRunner loadData(ShipmentRepository shipmentRepo, UserRepository userRepository) {
        return args -> {
            // -------- Shipments seed (upsert by trackingId) --------
            Instant now = Instant.now();
            List<Shipment> seeds = Arrays.asList(
                    Shipment.builder()
                            .trackingId("PMJ1001")
                            .senderName("Warehouse Pune")
                            .receiverName("Rahul")
                            .origin("Pune")
                            .destination("Bengaluru")
                            .currentStatus("IN_TRANSIT")
                            .expectedDelivery(now.plus(3, ChronoUnit.DAYS))
                            .build(),

                    Shipment.builder()
                            .trackingId("PMJ1002")
                            .senderName("Warehouse Hyderabad")
                            .receiverName("Anjali")
                            .origin("Hyderabad")
                            .destination("Pune")
                            .currentStatus("DELIVERED")
                            .expectedDelivery(now.minus(1, ChronoUnit.DAYS))
                            .build(),

                    Shipment.builder()
                            .trackingId("PMJ2008")
                            .senderName("Warehouse Terminal")
                            .receiverName("Tara")
                            .origin("Pune")
                            .destination("Hyderabad")
                            .currentStatus("CREATED")
                            .expectedDelivery(now.plus(2, ChronoUnit.DAYS))
                            .build()
            );

            List<Shipment> existingList = shipmentRepo.findAll();
            Map<String, Shipment> existingByTracking = new HashMap<>();
            for (Shipment s : existingList) {
                if (s.getTrackingId() != null) {
                    existingByTracking.put(s.getTrackingId(), s);
                }
            }

            for (Shipment seed : seeds) {
                String tid = seed.getTrackingId();
                if (tid == null) continue;

                if (existingByTracking.containsKey(tid)) {
                    Shipment existing = existingByTracking.get(tid);
                    existing.setSenderName(seed.getSenderName());
                    existing.setReceiverName(seed.getReceiverName());
                    existing.setOrigin(seed.getOrigin());
                    existing.setDestination(seed.getDestination());
                    existing.setCurrentStatus(seed.getCurrentStatus());
                    existing.setExpectedDelivery(seed.getExpectedDelivery());
                    existing.setUpdatedAt(Instant.now());
                    shipmentRepo.save(existing);
                    System.out.println("[DataLoader] Updated shipment: " + tid);
                } else {
                    seed.setCreatedAt(Instant.now());
                    seed.setUpdatedAt(Instant.now());
                    shipmentRepo.save(seed);
                    System.out.println("[DataLoader] Inserted shipment: " + tid);
                }
            }

            // -------- Dev admin user (idempotent) --------
            final String email = "sherliewaghmare@gmail.com";
            final String plainPassword = "PMJ123"; // dev password — change in production
            BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

            Optional<User> existingUser = userRepository.findByEmail(email);
            if (existingUser.isPresent()) {
                User user = existingUser.get();
                user.setPassword(encoder.encode(plainPassword));
                user.setRole("ADMIN");
                if (user.getName() == null || user.getName().isBlank()) {
                    user.setName("Admin");
                }
                user.setUpdatedAt(Instant.now());
                userRepository.save(user);
                System.out.println("[DataLoader] Updated existing admin user: " + email);
            } else {
                // Use explicit constructor present in your User class
                User admin = new User("Admin", email, encoder.encode(plainPassword), "ADMIN");
                admin.setCreatedAt(Instant.now());
                admin.setUpdatedAt(Instant.now());
                userRepository.save(admin);
                System.out.println("[DataLoader] Created dev admin user: " + email);
            }

            System.out.println("[DataLoader] Done.");
        };
    }
}
