package com.pmj.backend.service;

import com.pmj.backend.model.Shipment;
import com.pmj.backend.model.StatusUpdate;
import com.pmj.backend.repository.ShipmentRepository;
import com.pmj.backend.repository.StatusUpdateRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
public class ShipmentService {
    private final ShipmentRepository shipmentRepository;
    private final StatusUpdateRepository statusUpdateRepository;

    public ShipmentService(ShipmentRepository shipmentRepository,
                           StatusUpdateRepository statusUpdateRepository) {
        this.shipmentRepository = shipmentRepository;
        this.statusUpdateRepository = statusUpdateRepository;
    }

    public Shipment createShipment(Shipment shipment) {
        shipment.setCreatedAt(Instant.now());
        shipment.setUpdatedAt(Instant.now());
        shipment.setCurrentStatus(shipment.getCurrentStatus() == null ? "CREATED" : shipment.getCurrentStatus());
        return shipmentRepository.save(shipment);
    }

    public Shipment getByTrackingId(String trackingId) {
        return shipmentRepository.findByTrackingId(trackingId)
                .orElseThrow(() -> new RuntimeException("Shipment not found"));
    }

    public List<Shipment> getAll() {
        return shipmentRepository.findAll();
    }

    public Shipment updateStatus(Long id, String newStatus) {
        Shipment s = shipmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Shipment not found"));
        s.setCurrentStatus(newStatus);
        s.setUpdatedAt(Instant.now());
        var saved = shipmentRepository.save(s);

        StatusUpdate su = StatusUpdate.builder()
                .shipment(saved)
                .status(newStatus)
                .timestamp(Instant.now())
                .build();
        statusUpdateRepository.save(su);
        return saved;
    }

    public List<StatusUpdate> getStatusUpdates(Long shipmentId) {
        return statusUpdateRepository.findByShipmentIdOrderByTimestampDesc(shipmentId);
    }
}
