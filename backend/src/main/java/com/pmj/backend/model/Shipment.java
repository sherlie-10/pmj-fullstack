package com.pmj.backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity
@Table(name = "shipments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Shipment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String trackingId;

    private String senderName;
    private String receiverName;
    private String origin;
    private String destination;
    private String currentStatus;
    // Add near other fields
    private Instant expectedDelivery;

    private Instant createdAt = Instant.now();
    private Instant updatedAt = Instant.now();
}
