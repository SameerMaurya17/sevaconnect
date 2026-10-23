package com.sevadeep.sevaconnect.config;

import com.sevadeep.sevaconnect.entity.Event;
import com.sevadeep.sevaconnect.entity.User;
import com.sevadeep.sevaconnect.repository.EventRepository;
import com.sevadeep.sevaconnect.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;

/** Creates the admin account, a few demo volunteers and demo events on first start. */
@Component
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final EventRepository eventRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UserRepository userRepository, EventRepository eventRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.eventRepository = eventRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (userRepository.count() == 0) {
            createUser("SevaDeep Admin", "admin@seva.org", "admin123", "ADMIN", "9000000000", null, null, null);
            createUser("Priya Sharma", "priya@seva.org", "volunteer123", "VOLUNTEER", "9000000001",
                    "Cooking,Organizing", "FOOD", "SAT,SUN");
            createUser("Rahul Patil", "rahul@seva.org", "volunteer123", "VOLUNTEER", "9000000002",
                    "Driving,First Aid", "FOOD,HEALTH", "SAT");
            createUser("Anita Deshmukh", "anita@seva.org", "volunteer123", "VOLUNTEER", "9000000003",
                    "Gardening,Cleaning", "PLANTATION,CLEANLINESS", "SAT,SUN");
            createUser("Rohan Joshi", "rohan@seva.org", "volunteer123", "VOLUNTEER", "9000000004",
                    "Teaching,Photography", "EDUCATION", "MON,WED,FRI");
            createUser("Sneha Kulkarni", "sneha@seva.org", "volunteer123", "VOLUNTEER", "9000000005",
                    "Cooking,Driving,Cleaning", "FOOD,CLEANLINESS", "SAT,SUN");
        }

        if (eventRepository.count() == 0) {
            LocalDate nextSaturday = LocalDate.now().with(TemporalAdjusters.next(DayOfWeek.SATURDAY));
            LocalDate nextSunday = LocalDate.now().with(TemporalAdjusters.next(DayOfWeek.SUNDAY));

            createEvent("Community Food Distribution", "Prepare and distribute meals to families in need.",
                    "FOOD", "City Community Hall", nextSaturday, 15, "Cooking,Driving");
            createEvent("Tree Plantation Drive", "Plant saplings and learn how to care for them.",
                    "PLANTATION", "Municipal Garden", nextSunday, 20, "Gardening");
            createEvent("Riverside Cleanliness Drive", "Clean the riverside and sort the collected waste.",
                    "CLEANLINESS", "Riverside Ghat", nextSaturday.plusWeeks(1), 25, "Cleaning,Organizing");
        }
    }

    private void createUser(String name, String email, String password, String role, String phone,
                            String skills, String interests, String days) {
        User u = new User();
        u.setName(name);
        u.setEmail(email);
        u.setPassword(passwordEncoder.encode(password));
        u.setRole(role);
        u.setPhone(phone);
        u.setSkills(skills);
        u.setInterests(interests);
        u.setAvailableDays(days);
        userRepository.save(u);
    }

    private void createEvent(String title, String description, String category, String location,
                             LocalDate date, int capacity, String requiredSkills) {
        Event e = new Event();
        e.setTitle(title);
        e.setDescription(description);
        e.setCategory(category);
        e.setLocation(location);
        e.setEventDate(date);
        e.setCapacity(capacity);
        e.setRequiredSkills(requiredSkills);
        eventRepository.save(e);
    }
}
