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

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

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

        boolean alreadyBooked = ticketRepository.existsByEventIdAndUserEmailAndStatusIn(
                eventId, userEmail, List.of(TicketStatus.PAID, TicketStatus.USED)
        );
        if (alreadyBooked) {
            throw new RuntimeException("User already has a ticket for this event");
        }

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
        responseDTO.setEventId(event.getId());
        responseDTO.setEventTitle(event.getTitle());
        responseDTO.setUserName(user.getName());
        responseDTO.setUserEmail(user.getEmail());
        responseDTO.setUserRegistrationNumber(user.getRegistrationNumber());
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
        responseDTO.setEventId(ticket.getEvent().getId());
        responseDTO.setEventTitle(ticket.getEvent().getTitle());
        responseDTO.setUserName(ticket.getUser().getName());
        responseDTO.setUserEmail(ticket.getUser().getEmail());
        responseDTO.setUserRegistrationNumber(ticket.getUser().getRegistrationNumber());
        responseDTO.setQrCodeHash(ticket.getQrCodeHash());
        responseDTO.setStatus(ticket.getStatus());

        return responseDTO;
    }

    public List<TicketResponseDTO> getMyTickets(String userEmail) {
        List<Ticket> tickets = ticketRepository.findByUserEmailAndStatusIn(
                userEmail, List.of(TicketStatus.PAID, TicketStatus.USED)
        );

        return tickets.stream().map(ticket -> {
            TicketResponseDTO dto = new TicketResponseDTO();
            dto.setTicketId(ticket.getId());
            dto.setEventId(ticket.getEvent().getId());
            dto.setEventTitle(ticket.getEvent().getTitle());
            dto.setUserName(ticket.getUser().getName());
            dto.setUserEmail(ticket.getUser().getEmail());
            dto.setUserRegistrationNumber(ticket.getUser().getRegistrationNumber());
            dto.setQrCodeHash(ticket.getQrCodeHash());
            dto.setStatus(ticket.getStatus());
            return dto;
        }).collect(Collectors.toList());
    }

    public void cancelTicket(UUID ticketId, String userEmail) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        if (!ticket.getUser().getEmail().equals(userEmail)) {
            throw new RuntimeException("Unauthorized: Ticket does not belong to user");
        }

        if (ticket.getStatus() == TicketStatus.CANCELLED) {
            throw new RuntimeException("Ticket is already cancelled");
        }

        if (ticket.getStatus() == TicketStatus.USED) {
            throw new RuntimeException("Cannot cancel a used ticket");
        }

        ticket.setStatus(TicketStatus.CANCELLED);
        ticketRepository.save(ticket);

        Event event = ticket.getEvent();
        if (event.getCurrentTicketsSold() > 0) {
            event.setCurrentTicketsSold(event.getCurrentTicketsSold() - 1);
            eventRepository.save(event);
        }
    }
}
