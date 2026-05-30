package com.dahub.infrastructure.web;

import com.dahub.application.dto.EventCreateDTO;
import com.dahub.application.dto.EventResponseDTO;
import com.dahub.domain.service.EventService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events")
public class EventController {

    private final EventService eventService;

    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('DIRECTOR', 'VP')")
    public ResponseEntity<EventResponseDTO> createEvent(@Valid @RequestBody EventCreateDTO eventCreateDTO) {
        EventResponseDTO eventResponse = eventService.createEvent(eventCreateDTO);
        return ResponseEntity.ok(eventResponse);
    }

    @GetMapping
    public ResponseEntity<List<EventResponseDTO>> getAllEvents() {
        List<EventResponseDTO> events = eventService.findAllEvents();
        return ResponseEntity.ok(events);
    }
}
