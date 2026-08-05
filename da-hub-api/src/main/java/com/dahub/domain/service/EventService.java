package com.dahub.domain.service;

import com.dahub.application.dto.EventCreateDTO;
import com.dahub.application.dto.EventResponseDTO;
import com.dahub.domain.entity.Event;
import com.dahub.domain.repository.EventRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class EventService {

    private final EventRepository eventRepository;

    public EventService(EventRepository eventRepository) {
        this.eventRepository = eventRepository;
    }

    @Transactional
    public EventResponseDTO createEvent(EventCreateDTO dto) {
        Event event = new Event();
        event.setTitle(dto.getTitle());
        event.setDescription(dto.getDescription());
        event.setCategory(dto.getCategory());
        event.setEventDate(dto.getEventDate());
        event.setMaxCapacity(dto.getMaxCapacity());
        event.setCurrentTicketsSold(0);

        event.setIsPaid(dto.getIsPaid() != null ? dto.getIsPaid() : false);
        event.setPrice(dto.getPrice() != null ? dto.getPrice() : 0.0);
        event.setMaxTicketsPerUser(dto.getMaxTicketsPerUser() != null ? dto.getMaxTicketsPerUser() : 1);
        event.setRequiresAttachment(dto.getRequiresAttachment() != null ? dto.getRequiresAttachment() : false);
        event.setAttachmentRequirementsJson(dto.getAttachmentRequirementsJson());
        event.setBannerUrl(dto.getBannerUrl());

        event = eventRepository.save(event);

        return mapToResponse(event);
    }

    @Transactional
    public EventResponseDTO updateEvent(java.util.UUID id, EventCreateDTO dto) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Evento não encontrado com ID: " + id));

        event.setTitle(dto.getTitle());
        event.setDescription(dto.getDescription());
        event.setCategory(dto.getCategory());
        event.setEventDate(dto.getEventDate());
        event.setMaxCapacity(dto.getMaxCapacity());
        event.setIsPaid(dto.getIsPaid() != null ? dto.getIsPaid() : false);
        event.setPrice(dto.getPrice() != null ? dto.getPrice() : 0.0);
        event.setMaxTicketsPerUser(dto.getMaxTicketsPerUser() != null ? dto.getMaxTicketsPerUser() : 1);
        event.setRequiresAttachment(dto.getRequiresAttachment() != null ? dto.getRequiresAttachment() : false);
        event.setAttachmentRequirementsJson(dto.getAttachmentRequirementsJson());
        event.setBannerUrl(dto.getBannerUrl());

        event = eventRepository.save(event);
        return mapToResponse(event);
    }

    public Page<EventResponseDTO> findAllEvents(Pageable pageable) {
        return eventRepository.findAll(pageable)
                .map(this::mapToResponse);
    }

    private EventResponseDTO mapToResponse(Event event) {
        EventResponseDTO response = new EventResponseDTO();
        response.setId(event.getId());
        response.setTitle(event.getTitle());
        response.setDescription(event.getDescription());
        response.setCategory(event.getCategory());
        response.setEventDate(event.getEventDate());
        response.setMaxCapacity(event.getMaxCapacity());
        response.setCurrentTicketsSold(event.getCurrentTicketsSold());
        response.setIsPaid(event.getIsPaid());
        response.setPrice(event.getPrice());
        response.setMaxTicketsPerUser(event.getMaxTicketsPerUser());
        response.setRequiresAttachment(event.getRequiresAttachment());
        response.setAttachmentRequirementsJson(event.getAttachmentRequirementsJson());
        response.setBannerUrl(event.getBannerUrl());
        return response;
    }
}
