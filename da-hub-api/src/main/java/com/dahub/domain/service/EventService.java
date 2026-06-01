package com.dahub.domain.service;

import com.dahub.application.dto.EventCreateDTO;
import com.dahub.application.dto.EventResponseDTO;
import com.dahub.domain.entity.Event;
import com.dahub.domain.repository.EventRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class EventService {

    private final EventRepository eventRepository;

    public EventService(EventRepository eventRepository) {
        this.eventRepository = eventRepository;
    }

    public EventResponseDTO createEvent(EventCreateDTO dto) {
        Event event = new Event();
        event.setTitle(dto.getTitle());
        event.setDescription(dto.getDescription());
        event.setCategory(dto.getCategory());
        event.setEventDate(dto.getEventDate());
        event.setMaxCapacity(dto.getMaxCapacity());
        event.setCurrentTicketsSold(0);

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
        return response;
    }
}
