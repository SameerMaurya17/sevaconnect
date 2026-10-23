package com.sevadeep.sevaconnect.controller;

import com.sevadeep.sevaconnect.dto.Dtos.EventResponse;
import com.sevadeep.sevaconnect.dto.Dtos.RegistrationResponse;
import com.sevadeep.sevaconnect.dto.Mappers;
import com.sevadeep.sevaconnect.entity.Event;
import com.sevadeep.sevaconnect.entity.Registration;
import com.sevadeep.sevaconnect.entity.User;
import com.sevadeep.sevaconnect.repository.EventRepository;
import com.sevadeep.sevaconnect.repository.RegistrationRepository;
import com.sevadeep.sevaconnect.service.CurrentUserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/events")
public class EventController {

    private final EventRepository eventRepository;
    private final RegistrationRepository registrationRepository;
    private final CurrentUserService currentUserService;

    public EventController(EventRepository eventRepository,
                           RegistrationRepository registrationRepository,
                           CurrentUserService currentUserService) {
        this.eventRepository = eventRepository;
        this.registrationRepository = registrationRepository;
        this.currentUserService = currentUserService;
    }

    /** All events (soonest first), with how many people joined and whether the current user joined. */
    @GetMapping
    public List<EventResponse> list(Authentication authentication) {
        User user = currentUserService.get(authentication);
        Set<Long> joinedIds = registrationRepository.findByUserId(user.getId()).stream()
                .map(r -> r.getEvent().getId())
                .collect(Collectors.toSet());

        return eventRepository.findAllByOrderByEventDateAsc().stream()
                .map(e -> Mappers.toEvent(e, registrationRepository.countByEventId(e.getId()), joinedIds.contains(e.getId())))
                .toList();
    }

    @PostMapping("/{id}/join")
    public ResponseEntity<RegistrationResponse> join(@PathVariable Long id, Authentication authentication) {
        User user = currentUserService.get(authentication);
        if (!"VOLUNTEER".equals(user.getRole())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only volunteers can join events");
        }

        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found"));

        if (event.getEventDate().isBefore(LocalDate.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "This event has already taken place");
        }
        if (registrationRepository.existsByEventIdAndUserId(id, user.getId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "You have already joined this event");
        }
        if (registrationRepository.countByEventId(id) >= event.getCapacity()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "This event is full");
        }

        Registration registration = new Registration();
        registration.setEvent(event);
        registration.setUser(user);
        Registration saved = registrationRepository.save(registration);

        return ResponseEntity.status(HttpStatus.CREATED).body(Mappers.toRegistration(saved));
    }

    @DeleteMapping("/{id}/join")
    public ResponseEntity<Void> cancel(@PathVariable Long id, Authentication authentication) {
        User user = currentUserService.get(authentication);

        Registration registration = registrationRepository.findByEventIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "You have not joined this event"));

        if (registration.getEvent().getEventDate().isBefore(LocalDate.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You cannot cancel a past event");
        }

        registrationRepository.delete(registration);
        return ResponseEntity.noContent().build();
    }
}
