package com.sevadeep.sevaconnect.service;

import com.sevadeep.sevaconnect.dto.Dtos.MatchResponse;
import com.sevadeep.sevaconnect.entity.Event;
import com.sevadeep.sevaconnect.entity.User;
import com.sevadeep.sevaconnect.repository.RegistrationRepository;
import com.sevadeep.sevaconnect.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Smart Volunteer Matcher.
 *
 * Score (0-100) = 50% skill match + 30% interest match + 20% availability match
 *  - skill match:        matched required skills / total required skills (100% if the event needs none)
 *  - interest match:     1 if the event category is in the volunteer's interests
 *  - availability match: 1 if the event's weekday is in the volunteer's available days
 */
@Service
public class MatcherService {

    private final UserRepository userRepository;
    private final RegistrationRepository registrationRepository;

    public MatcherService(UserRepository userRepository, RegistrationRepository registrationRepository) {
        this.userRepository = userRepository;
        this.registrationRepository = registrationRepository;
    }

    public List<MatchResponse> findMatches(Event event) {
        Set<Long> alreadyRegistered = registrationRepository.findByEventId(event.getId()).stream()
                .map(r -> r.getUser().getId())
                .collect(Collectors.toSet());

        List<String> requiredSkills = splitKeepCase(event.getRequiredSkills());
        String category = event.getCategory() == null ? "" : event.getCategory().trim().toLowerCase();
        // MONDAY -> "mon", SATURDAY -> "sat" ...
        String day = event.getEventDate().getDayOfWeek().name().substring(0, 3).toLowerCase();

        List<MatchResponse> results = new ArrayList<>();
        for (User volunteer : userRepository.findByRole("VOLUNTEER")) {
            if (alreadyRegistered.contains(volunteer.getId())) {
                continue;
            }
            results.add(score(volunteer, requiredSkills, category, day));
        }

        results.sort((a, b) -> {
            if (a.score() != b.score()) {
                return Integer.compare(b.score(), a.score());
            }
            return a.name().compareToIgnoreCase(b.name());
        });
        return results;
    }

    private MatchResponse score(User v, List<String> requiredSkills, String category, String day) {
        Set<String> haveSkills = splitLower(v.getSkills());
        Set<String> interests = splitLower(v.getInterests());
        Set<String> days = splitLower(v.getAvailableDays());

        List<String> matchedSkills = requiredSkills.stream()
                .filter(s -> haveSkills.contains(s.toLowerCase()))
                .collect(Collectors.toList());

        double skillRatio = requiredSkills.isEmpty() ? 1.0 : (double) matchedSkills.size() / requiredSkills.size();
        boolean interestMatch = !category.isEmpty() && interests.contains(category);
        boolean availabilityMatch = days.contains(day);

        double total = skillRatio * 50 + (interestMatch ? 30 : 0) + (availabilityMatch ? 20 : 0);

        return new MatchResponse(
                v.getId(), v.getName(), v.getEmail(), v.getPhone(),
                (int) Math.round(total),
                (int) Math.round(skillRatio * 100),
                interestMatch, availabilityMatch, matchedSkills);
    }

    private static List<String> splitKeepCase(String csv) {
        if (csv == null || csv.isBlank()) {
            return List.of();
        }
        return Arrays.stream(csv.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());
    }

    private static Set<String> splitLower(String csv) {
        return splitKeepCase(csv).stream().map(String::toLowerCase).collect(Collectors.toSet());
    }
}
