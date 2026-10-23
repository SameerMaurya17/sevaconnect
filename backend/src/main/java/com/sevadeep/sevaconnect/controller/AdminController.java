package com.sevadeep.sevaconnect.controller;

import com.sevadeep.sevaconnect.dto.Dtos.AttendanceRequest;
import com.sevadeep.sevaconnect.dto.Dtos.EventRequest;
import com.sevadeep.sevaconnect.dto.Dtos.EventResponse;
import com.sevadeep.sevaconnect.dto.Dtos.MatchResponse;
import com.sevadeep.sevaconnect.dto.Dtos.RegistrationResponse;
import com.sevadeep.sevaconnect.dto.Mappers;
import com.sevadeep.sevaconnect.entity.Event;
import com.sevadeep.sevaconnect.entity.Registration;
import com.sevadeep.sevaconnect.repository.EventRepository;
import com.sevadeep.sevaconnect.repository.RegistrationRepository;
import com.sevadeep.sevaconnect.service.MatcherService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

/** Everything under /api/admin/** is restricted to the ADMIN role in SecurityConfig. */
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final EventRepository eventRepository;
    private final RegistrationRepository registrationRepository;
    private final MatcherService matcherService;

    public AdminController(EventRepository eventRepository,
                           RegistrationRepository registrationRepository,
                           MatcherService matcherService) {
        this.eventRepository = eventRepository;
        this.registrationRepository = registrationRepository;
        this.matcherService = matcherService;
    }

    // ------------------------------ events ------------------------------

    @PostMapping("/events")
    public ResponseEntity<EventResponse> createEvent(@Valid @RequestBody EventRequest request) {
        Event event = new Event();
        apply(event, request);
        Event saved = eventRepository.save(event);
        return ResponseEntity.status(HttpStatus.CREATED).body(Mappers.toEvent(saved, 0, false));
    }

    @PutMapping("/events/{id}")
    public EventResponse updateEvent(@PathVariable Long id, @Valid @RequestBody EventRequest request) {
        Event event = findEvent(id);
        apply(event, request);
        Event saved = eventRepository.save(event);
        return Mappers.toEvent(saved, registrationRepository.countByEventId(id), false);
    }

    @DeleteMapping("/events/{id}")
    @Transactional
    public ResponseEntity<Void> deleteEvent(@PathVariable Long id) {
        Event event = findEvent(id);
        registrationRepository.deleteByEventId(id); // remove registrations first
        eventRepository.delete(event);
        return ResponseEntity.noContent().build();
    }

    // --------------------------- smart matcher ---------------------------

    @GetMapping("/events/{id}/matches")
    public List<MatchResponse> matches(@PathVariable Long id) {
        return matcherService.findMatches(findEvent(id));
    }

    // ----------------------- registrations / attendance -----------------------

    @GetMapping("/events/{id}/registrations")
    public List<RegistrationResponse> registrations(@PathVariable Long id) {
        findEvent(id);
        return registrationRepository.findByEventId(id).stream()
                .map(Mappers::toRegistration)
                .sorted((a, b) -> a.userName().compareToIgnoreCase(b.userName()))
                .toList();
    }

    @PutMapping("/registrations/{id}/attendance")
    public RegistrationResponse markAttendance(@PathVariable Long id, @Valid @RequestBody AttendanceRequest request) {
        Registration registration = registrationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Registration not found"));

        registration.setAttended(request.attended());
        registration.setHours(request.attended() ? request.hours() : 0);
        return Mappers.toRegistration(registrationRepository.save(registration));
    }

    // ------------------------------ helpers ------------------------------

    private Event findEvent(Long id) {
        return eventRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found"));
    }

    private void apply(Event event, EventRequest request) {
        event.setTitle(request.title().trim());
        event.setDescription(request.description());
        event.setCategory(request.category().trim().toUpperCase());
        event.setLocation(request.location().trim());
        event.setEventDate(request.eventDate());
        event.setCapacity(request.capacity());
        event.setRequiredSkills(request.requiredSkills());
    }
}
