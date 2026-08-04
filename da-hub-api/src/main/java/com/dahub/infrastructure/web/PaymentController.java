package com.dahub.infrastructure.web;

import com.dahub.domain.entity.Ticket;
import com.dahub.domain.repository.TicketRepository;
import com.dahub.domain.service.PaymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;
    private final TicketRepository ticketRepository;

    public PaymentController(PaymentService paymentService, TicketRepository ticketRepository) {
        this.paymentService = paymentService;
        this.ticketRepository = ticketRepository;
    }

    @PostMapping("/preference/{ticketId}")
    @PreAuthorize("hasAnyRole('STUDENT', 'DIRECTOR', 'VP')")
    public ResponseEntity<Map<String, Object>> createPreference(@PathVariable UUID ticketId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        Map<String, Object> preference = paymentService.createMercadoPagoPreference(ticket);
        return ResponseEntity.ok(preference);
    }

    @PostMapping("/{ticketId}/approve")
    @PreAuthorize("hasAnyRole('STUDENT', 'DIRECTOR', 'VP')")
    public ResponseEntity<Void> approvePayment(@PathVariable UUID ticketId) {
        boolean approved = paymentService.approvePayment(ticketId);
        if (approved) {
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.badRequest().build();
    }
}
