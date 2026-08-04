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
    private final com.dahub.domain.service.FileUploadService fileUploadService;

    public TicketController(TicketService ticketService, com.dahub.domain.service.FileUploadService fileUploadService) {
        this.ticketService = ticketService;
        this.fileUploadService = fileUploadService;
    }

    @PostMapping("/book/{eventId}")
    @PreAuthorize("hasAnyRole('STUDENT', 'DIRECTOR', 'VP')")
    public ResponseEntity<TicketResponseDTO> bookTicket(@PathVariable UUID eventId) {
        String userEmail = extractEmailFromPrincipal();
        TicketResponseDTO ticketResponse = ticketService.bookTicket(eventId, userEmail);
        return ResponseEntity.ok(ticketResponse);
    }

    @PostMapping(value = "/book-with-attachments/{eventId}", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('STUDENT', 'DIRECTOR', 'VP')")
    public ResponseEntity<TicketResponseDTO> bookTicketWithAttachments(
            @PathVariable UUID eventId,
            @RequestPart(value = "files", required = false) java.util.List<org.springframework.web.multipart.MultipartFile> files,
            @RequestParam(value = "labels", required = false) java.util.List<String> labels) {
        String userEmail = extractEmailFromPrincipal();
        TicketResponseDTO ticketResponse = ticketService.bookTicketWithAttachments(eventId, userEmail, files, labels, fileUploadService);
        return ResponseEntity.ok(ticketResponse);
    }

    @GetMapping("/event/{eventId}")
    @PreAuthorize("hasAnyRole('DIRECTOR', 'VP')")
    public ResponseEntity<java.util.List<TicketResponseDTO>> getTicketsByEvent(@PathVariable UUID eventId) {
        return ResponseEntity.ok(ticketService.getTicketsByEvent(eventId));
    }

    @PutMapping("/{ticketId}/status")
    @PreAuthorize("hasAnyRole('DIRECTOR', 'VP')")
    public ResponseEntity<TicketResponseDTO> updateTicketStatusAdmin(
            @PathVariable UUID ticketId,
            @RequestParam com.dahub.domain.entity.enums.TicketStatus status) {
        return ResponseEntity.ok(ticketService.updateTicketStatusAdmin(ticketId, status));
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
