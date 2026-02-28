package com.sliit.smartcampus.config;

import com.sliit.smartcampus.event.CampusEvent;
import com.sliit.smartcampus.event.CampusEventRepository;
import com.sliit.smartcampus.resource.LearningResource;
import com.sliit.smartcampus.resource.LearningResourceRepository;
import com.sliit.smartcampus.service.CampusServiceItem;
import com.sliit.smartcampus.service.CampusServiceRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class DataInitializer {
    @Bean
    CommandLineRunner seedData(
            CampusEventRepository eventRepository,
            LearningResourceRepository resourceRepository,
            CampusServiceRepository serviceRepository
    ) {
        return args -> {
            if (eventRepository.count() == 0) {
                eventRepository.saveAll(List.of(
                        new CampusEvent(
                                "Innovation Meetup",
                                "Startup ideation and prototype discussion with faculty mentors.",
                                "2026-03-10",
                                "Engineering Auditorium"
                        ),
                        new CampusEvent(
                                "Career Accelerator",
                                "Industry panel and CV clinic for internship and graduate roles.",
                                "2026-03-14",
                                "Main Hall"
                        ),
                        new CampusEvent(
                                "Wellness Week",
                                "Guided activities on mental health, nutrition, and fitness.",
                                "2026-03-20",
                                "Student Center"
                        )
                ));
            }

            if (resourceRepository.count() == 0) {
                resourceRepository.saveAll(List.of(
                        new LearningResource(
                                "Digital Library Access",
                                "Central search for journals, books, and citation databases.",
                                "Library"
                        ),
                        new LearningResource(
                                "Study Space Finder",
                                "Live availability for quiet rooms and team collaboration areas.",
                                "Infrastructure"
                        ),
                        new LearningResource(
                                "Cloud Lab Environment",
                                "Provisioned coding environments for software modules.",
                                "Technology"
                        )
                ));
            }

            if (serviceRepository.count() == 0) {
                serviceRepository.saveAll(List.of(
                        new CampusServiceItem(
                                "Health Desk Support",
                                "Appointment management and preventive care guidance.",
                                "active"
                        ),
                        new CampusServiceItem(
                                "Academic Advising",
                                "Scheduling and tracking for academic consultations.",
                                "active"
                        ),
                        new CampusServiceItem(
                                "Administrative Helpdesk",
                                "Assistance for registration, letters, and payments.",
                                "maintenance"
                        )
                ));
            }
        };
    }
}
