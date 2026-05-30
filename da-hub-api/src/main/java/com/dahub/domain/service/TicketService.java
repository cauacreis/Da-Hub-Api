package com.dahub.domain.service;

import com.dahub.application.dto.TicketResponseDTO;
import com.dahub.domain.entity.Event;
import com.dahub.domain.entity.Ticket;
import com.dahub.domain.entity.User;
import com.dahub.domain.entity.enums.TicketStatus;
import com.dahub.domain.repository.EventRepository;
import com.dahub.domain.repository.TicketRepository;
import com.dahub.domain.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class TicketService {

    private final TicketRepository ticketRepository;
    private final EventRepository eventRepository;
    private final UserRepository userRepository;

    public TicketService(TicketRepository ticketRepository, EventRepository eventRepository, UserRepository userRepository) {
        this.ticketRepository = ticketRepository;
        this.eventRepository = eventRepository;
        this.userRepository = userRepository;
    }

    public TicketResponseDTO bookTicket(UUID eventId, String userEmail) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        if (event.getCurrentTicketsSold() >= event.getMaxCapacity()) {
            throw new RuntimeException("Event is full");
        }

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String qrCodeHash = UUID.randomUUID().toString() + "-" + user.getId().toString();

        Ticket ticket = new Ticket();
        ticket.setEvent(event);
        ticket.setUser(user);
        ticket.setStatus(TicketStatus.PAID);
        ticket.setQrCodeHash(qrCodeHash);

        event.setCurrentTicketsSold(event.getCurrentTicketsSold() + 1);
        eventRepository.save(event);

        ticket = ticketRepository.save(ticket);

        TicketResponseDTO responseDTO = new TicketResponseDTO();
        responseDTO.setTicketId(ticket.getId());
        responseDTO.setEventTitle(event.getTitle());
        responseDTO.setUserName(user.getName());
        responseDTO.setQrCodeHash(ticket.getQrCodeHash());
        responseDTO.setStatus(ticket.getStatus());

        return responseDTO;
    }

    public TicketResponseDTO scanTicket(String qrCodeHash) {
        Ticket ticket = ticketRepository.findByQrCodeHash(qrCodeHash)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        if (ticket.getStatus() == TicketStatus.USED) {
            throw new RuntimeException("Ticket already used");
        }

        if (ticket.getStatus() == TicketStatus.CANCELLED) {
            throw new RuntimeException("Ticket cancelled");
        }

        if (ticket.getStatus() == TicketStatus.PAID) {
            ticket.setStatus(TicketStatus.USED);
        }

        ticket = ticketRepository.save(ticket);

        TicketResponseDTO responseDTO = new TicketResponseDTO();
        responseDTO.setTicketId(ticket.getId());
        responseDTO.setEventTitle(ticket.getEvent().getTitle());
        responseDTO.setUserName(ticket.getUser().getName());
        responseDTO.setQrCodeHash(ticket.getQrCodeHash());
        responseDTO.setStatus(ticket.getStatus());

        return responseDTO;
    }
}
