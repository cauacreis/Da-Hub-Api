package com.dahub.infrastructure.web;

import com.dahub.application.dto.TicketResponseDTO;
import com.dahub.domain.service.TicketService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @PostMapping("/book/{eventId}")
    @PreAuthorize("hasAnyRole('STUDENT', 'DIRECTOR', 'VP')")
    public ResponseEntity<?> bookTicket(@PathVariable UUID eventId) {
        try {
            Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            String userEmail = "";
            if (principal instanceof com.dahub.domain.entity.User) {
                userEmail = ((com.dahub.domain.entity.User) principal).getEmail();
            } else if (principal instanceof String) {
                userEmail = (String) principal;
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Principal is of type: " + principal.getClass().getName());
            }

            System.out.println("Extracted email from token: [" + userEmail + "]");

            TicketResponseDTO ticketResponse = ticketService.bookTicket(eventId, userEmail);
            return ResponseEntity.ok(ticketResponse);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
}
