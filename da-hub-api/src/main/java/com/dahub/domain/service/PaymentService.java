package com.dahub.domain.service;

import com.dahub.domain.entity.Ticket;
import com.dahub.domain.entity.enums.TicketStatus;
import com.dahub.domain.repository.TicketRepository;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class PaymentService {

    private final TicketRepository ticketRepository;

    public PaymentService(TicketRepository ticketRepository) {
        this.ticketRepository = ticketRepository;
    }

    public Map<String, Object> createMercadoPagoPreference(Ticket ticket) {
        String mockPaymentId = "MP-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        ticket.setPaymentId(mockPaymentId);
        ticketRepository.save(ticket);

        Map<String, Object> response = new HashMap<>();
        response.put("paymentId", mockPaymentId);
        response.put("initPoint", "https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=" + mockPaymentId);
        response.put("qrCodePix", "00020126580014BR.GOV.BCB.PIX0136" + mockPaymentId + "5204000053039865405" + String.format("%.2f", ticket.getEvent().getPrice()).replace(",", ".") + "5802BR5913DA HUB EVENTOS6008ANAPOLIS62070503***6304");
        response.put("amount", ticket.getEvent().getPrice());
        response.put("status", ticket.getStatus());
        return response;
    }

    public boolean approvePayment(UUID ticketId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        if (ticket.getStatus() == TicketStatus.PENDING_PAYMENT) {
            ticket.setStatus(TicketStatus.PAID);
            ticketRepository.save(ticket);
            return true;
        }
        return false;
    }
}
