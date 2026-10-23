package com.sevadeep.sevaconnect.controller;

import com.sevadeep.sevaconnect.dto.Dtos.ProfileRequest;
import com.sevadeep.sevaconnect.dto.Dtos.RegistrationResponse;
import com.sevadeep.sevaconnect.dto.Dtos.UserResponse;
import com.sevadeep.sevaconnect.dto.Mappers;
import com.sevadeep.sevaconnect.entity.User;
import com.sevadeep.sevaconnect.repository.RegistrationRepository;
import com.sevadeep.sevaconnect.repository.UserRepository;
import com.sevadeep.sevaconnect.service.CurrentUserService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class ProfileController {

    private final CurrentUserService currentUserService;
    private final UserRepository userRepository;
    private final RegistrationRepository registrationRepository;

    public ProfileController(CurrentUserService currentUserService,
                             UserRepository userRepository,
                             RegistrationRepository registrationRepository) {
        this.currentUserService = currentUserService;
        this.userRepository = userRepository;
        this.registrationRepository = registrationRepository;
    }

    /** Used by the frontend to log in (verifies the credentials) and to load the profile. */
    @GetMapping("/api/me")
    public UserResponse me(Authentication authentication) {
        return Mappers.toUser(currentUserService.get(authentication));
    }

    @PutMapping("/api/me")
    public UserResponse updateProfile(Authentication authentication, @Valid @RequestBody ProfileRequest request) {
        User user = currentUserService.get(authentication);
        user.setName(request.name().trim());
        user.setPhone(request.phone());
        user.setSkills(request.skills());
        user.setInterests(request.interests());
        user.setAvailableDays(request.availableDays());
        return Mappers.toUser(userRepository.save(user));
    }

    /** The logged-in volunteer's events with attendance and hours. */
    @GetMapping("/api/me/registrations")
    public List<RegistrationResponse> myRegistrations(Authentication authentication) {
        User user = currentUserService.get(authentication);
        return registrationRepository.findByUserId(user.getId()).stream()
                .map(Mappers::toRegistration)
                .toList();
    }
}
