package com.sevadeep.sevaconnect.dto;

import com.sevadeep.sevaconnect.dto.Dtos.EventResponse;
import com.sevadeep.sevaconnect.dto.Dtos.RegistrationResponse;
import com.sevadeep.sevaconnect.dto.Dtos.UserResponse;
import com.sevadeep.sevaconnect.entity.Event;
import com.sevadeep.sevaconnect.entity.Registration;
import com.sevadeep.sevaconnect.entity.User;

/** Converts entities to response objects (so passwords and loops never reach JSON). */
public final class Mappers {

    private Mappers() {
    }

    public static UserResponse toUser(User u) {
        return new UserResponse(u.getId(), u.getName(), u.getEmail(), u.getPhone(),
                u.getRole(), u.getSkills(), u.getInterests(), u.getAvailableDays());
    }

    public static EventResponse toEvent(Event e, long registeredCount, boolean joined) {
        return new EventResponse(e.getId(), e.getTitle(), e.getDescription(), e.getCategory(),
                e.getLocation(), e.getEventDate(), e.getCapacity(), e.getRequiredSkills(),
                registeredCount, joined);
    }

    public static RegistrationResponse toRegistration(Registration r) {
        return new RegistrationResponse(r.getId(), r.getEvent().getId(), r.getEvent().getTitle(),
                r.getEvent().getEventDate(), r.getUser().getId(), r.getUser().getName(),
                r.getUser().getEmail(), r.isAttended(), r.getHours());
    }
}
