package com.pmj.backend.controller;

import com.pmj.backend.model.Shipment;
import com.pmj.backend.service.ShipmentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/shipments")
public class ShipmentController {
    private final ShipmentService shipmentService;

    public ShipmentController(ShipmentService shipmentService) {
        this.shipmentService = shipmentService;
    }

    @PostMapping
    public ResponseEntity<Shipment> create(@RequestBody Shipment shipment) {
        return ResponseEntity.ok(shipmentService.createShipment(shipment));
    }

    @GetMapping("/track/{trackingId}")
    public ResponseEntity<Shipment> track(@PathVariable String trackingId) {
        return ResponseEntity.ok(shipmentService.getByTrackingId(trackingId));
    }

    @GetMapping
    public ResponseEntity<List<Shipment>> getAll() {
        return ResponseEntity.ok(shipmentService.getAll());
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Shipment> updateStatus(@PathVariable Long id, @RequestParam String status) {
        return ResponseEntity.ok(shipmentService.updateStatus(id, status));
    }

    @GetMapping("/{id}/updates")
    public ResponseEntity<?> getUpdates(@PathVariable Long id) {
        return ResponseEntity.ok(shipmentService.getStatusUpdates(id));
    }
}
