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
            String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
            TicketResponseDTO ticketResponse = ticketService.bookTicket(eventId, userEmail);
            return ResponseEntity.ok(ticketResponse);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
}
