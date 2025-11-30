package com.pmj.backend.controller;

import com.pmj.backend.model.Enquiry;
import com.pmj.backend.service.EnquiryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/enquiry")
public class EnquiryController {
    private final EnquiryService enquiryService;

    public EnquiryController(EnquiryService enquiryService) {
        this.enquiryService = enquiryService;
    }

    @PostMapping
    public ResponseEntity<Enquiry> create(@RequestBody Enquiry enquiry) {
        return ResponseEntity.ok(enquiryService.saveEnquiry(enquiry));
    }

    @GetMapping
    public ResponseEntity<List<Enquiry>> getAll() {
        return ResponseEntity.ok(enquiryService.getAll());
    }
}
