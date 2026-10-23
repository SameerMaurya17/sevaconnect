package com.sevadeep.sevaconnect.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.List;

/** All request / response objects in one place to keep the project small. */
public final class Dtos {

    private Dtos() {
    }

    // ------------------------- requests -------------------------

    public record RegisterRequest(
            @NotBlank(message = "Name is required") String name,
            @NotBlank(message = "Email is required") @Email(message = "Enter a valid email") String email,
            @NotBlank(message = "Password is required")
            @Size(min = 6, message = "Password must be at least 6 characters") String password,
            String phone) {
    }

    public record ProfileRequest(
            @NotBlank(message = "Name is required") String name,
            String phone,
            String skills,
            String interests,
            String availableDays) {
    }

    public record EventRequest(
            @NotBlank(message = "Title is required") String title,
            String description,
            @NotBlank(message = "Category is required") String category,
            @NotBlank(message = "Location is required") String location,
            @NotNull(message = "Date is required") LocalDate eventDate,
            @Min(value = 1, message = "Capacity must be at least 1") int capacity,
            String requiredSkills) {
    }

    public record AttendanceRequest(
            boolean attended,
            @PositiveOrZero(message = "Hours cannot be negative") double hours) {
    }

    // ------------------------- responses -------------------------

    public record UserResponse(
            Long id,
            String name,
            String email,
            String phone,
            String role,
            String skills,
            String interests,
            String availableDays) {
    }

    public record EventResponse(
            Long id,
            String title,
            String description,
            String category,
            String location,
            LocalDate eventDate,
            int capacity,
            String requiredSkills,
            long registeredCount,
            boolean joined) {
    }

    public record RegistrationResponse(
            Long id,
            Long eventId,
            String eventTitle,
            LocalDate eventDate,
            Long userId,
            String userName,
            String userEmail,
            boolean attended,
            double hours) {
    }

    public record MatchResponse(
            Long userId,
            String name,
            String email,
            String phone,
            int score,
            int skillPercent,
            boolean interestMatch,
            boolean availabilityMatch,
            List<String> matchedSkills) {
    }
}
