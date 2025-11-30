package com.pmj.backend.service;

import com.pmj.backend.model.Enquiry;
import com.pmj.backend.repository.EnquiryRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EnquiryService {
    private final EnquiryRepository enquiryRepository;
    private final EmailService emailService;

    public EnquiryService(EnquiryRepository enquiryRepository, EmailService emailService) {
        this.enquiryRepository = enquiryRepository;
        this.emailService = emailService;
    }

    /**
     * Save an enquiry and send a notification email to the team.
     */
    public Enquiry saveEnquiry(Enquiry enquiry) {
        var saved = enquiryRepository.save(enquiry);
        // Simple email to team - change the recipient in properties or parameter for prod
        try {
            emailService.sendSimpleMessage("team@pmj.com",
                    "New Enquiry from " + saved.getName(),
                    "Message:\n\n" + saved.getMessage() + "\n\nContact: " + saved.getPhone() + " / " + saved.getEmail());
        } catch (Exception e) {
            // swallow or log - we already saved the enquiry; in prod you may retry or queue
            e.printStackTrace();
        }
        return saved;
    }

    public List<Enquiry> getAll() {
        return enquiryRepository.findAll();
    }
}
