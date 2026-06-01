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
    public ResponseEntity<TicketResponseDTO> bookTicket(@PathVariable UUID eventId) {
        String userEmail = extractEmailFromPrincipal();
        TicketResponseDTO ticketResponse = ticketService.bookTicket(eventId, userEmail);
        return ResponseEntity.ok(ticketResponse);
    }

    @PostMapping("/scan/{qrCodeHash}")
    @PreAuthorize("hasAnyRole('DIRECTOR', 'VP')")
    public ResponseEntity<TicketResponseDTO> scanTicket(@PathVariable String qrCodeHash) {
        TicketResponseDTO ticketResponse = ticketService.scanTicket(qrCodeHash);
        return ResponseEntity.ok(ticketResponse);
    }

    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('STUDENT', 'DIRECTOR', 'VP')")
    public ResponseEntity<?> getMyTickets() {
        String userEmail = extractEmailFromPrincipal();
        return ResponseEntity.ok(ticketService.getMyTickets(userEmail));
    }

    @PostMapping("/{ticketId}/cancel")
    @PreAuthorize("hasAnyRole('STUDENT', 'DIRECTOR', 'VP')")
    public ResponseEntity<Void> cancelTicket(@PathVariable UUID ticketId) {
        String userEmail = extractEmailFromPrincipal();
        ticketService.cancelTicket(ticketId, userEmail);
        return ResponseEntity.ok().build();
    }

    private String extractEmailFromPrincipal() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof com.dahub.domain.entity.User) {
            return ((com.dahub.domain.entity.User) principal).getEmail();
        } else if (principal instanceof String) {
            return (String) principal;
        }
        throw new RuntimeException("Could not extract email from principal");
    }
}
