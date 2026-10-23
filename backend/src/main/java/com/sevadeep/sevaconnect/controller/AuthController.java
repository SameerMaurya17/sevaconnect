package com.sevadeep.sevaconnect.controller;

import com.sevadeep.sevaconnect.dto.Dtos.RegisterRequest;
import com.sevadeep.sevaconnect.dto.Dtos.UserResponse;
import com.sevadeep.sevaconnect.dto.Mappers;
import com.sevadeep.sevaconnect.entity.User;
import com.sevadeep.sevaconnect.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthController(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@Valid @RequestBody RegisterRequest request) {
        String email = request.email().trim().toLowerCase();

        if (userRepository.existsByEmail(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "An account with this email already exists");
        }

        User user = new User();
        user.setName(request.name().trim());
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setPhone(request.phone() == null ? null : request.phone().trim());
        user.setRole("VOLUNTEER"); // public sign-up can only create volunteers

        User saved = userRepository.save(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(Mappers.toUser(saved));
    }
}
