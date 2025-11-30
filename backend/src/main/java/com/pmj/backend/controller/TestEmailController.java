package com.pmj.backend.controller;

import com.pmj.backend.service.EmailService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/test")
public class TestEmailController {
    private final EmailService emailService;

    public TestEmailController(EmailService emailService) {
        this.emailService = emailService;
    }

    @GetMapping("/send-email")
    public ResponseEntity<String> sendTestEmail(@RequestParam String to) {
        emailService.sendSimpleMessage(to, "PMJ test", "Hello from PMJ test email!");
        return ResponseEntity.ok("Triggered send to: " + to);
    }


}



