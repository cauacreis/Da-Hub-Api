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
            String userEmail = extractEmailFromPrincipal();

            TicketResponseDTO ticketResponse = ticketService.bookTicket(eventId, userEmail);
            return ResponseEntity.ok(ticketResponse);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PostMapping("/scan/{qrCodeHash}")
    @PreAuthorize("hasAnyRole('DIRECTOR', 'VP')")
    public ResponseEntity<?> scanTicket(@PathVariable String qrCodeHash) {
        try {
            TicketResponseDTO ticketResponse = ticketService.scanTicket(qrCodeHash);
            return ResponseEntity.ok(ticketResponse);
        } catch (org.springframework.orm.ObjectOptimisticLockingFailureException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Conflito: Ingresso já escaneado em outra transação");
        } catch (RuntimeException e) {
            if (e.getMessage().equals("Ticket not found")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('STUDENT', 'DIRECTOR', 'VP')")
    public ResponseEntity<?> getMyTickets() {
        try {
            String userEmail = extractEmailFromPrincipal();
            return ResponseEntity.ok(ticketService.getMyTickets(userEmail));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PostMapping("/{ticketId}/cancel")
    @PreAuthorize("hasAnyRole('STUDENT', 'DIRECTOR', 'VP')")
    public ResponseEntity<?> cancelTicket(@PathVariable UUID ticketId) {
        try {
            String userEmail = extractEmailFromPrincipal();
            ticketService.cancelTicket(ticketId, userEmail);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
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
