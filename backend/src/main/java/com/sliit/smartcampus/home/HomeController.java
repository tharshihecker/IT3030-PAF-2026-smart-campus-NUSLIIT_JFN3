package com.sliit.smartcampus.home;

import com.sliit.smartcampus.event.CampusEventRepository;
import com.sliit.smartcampus.resource.LearningResourceRepository;
import com.sliit.smartcampus.service.CampusServiceRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/home")
public class HomeController {
    private final CampusEventRepository eventRepository;
    private final LearningResourceRepository resourceRepository;
    private final CampusServiceRepository serviceRepository;

    public HomeController(
            CampusEventRepository eventRepository,
            LearningResourceRepository resourceRepository,
            CampusServiceRepository serviceRepository
    ) {
        this.eventRepository = eventRepository;
        this.resourceRepository = resourceRepository;
        this.serviceRepository = serviceRepository;
    }

    @GetMapping("/summary")
    public Map<String, Object> getSummary() {
        long totalEvents = eventRepository.count();
        long totalResources = resourceRepository.count();
        long totalServices = serviceRepository.count();
        long activeServices = serviceRepository.countByStatusIgnoreCase("active");

        return Map.of(
                "totalEvents", totalEvents,
                "totalResources", totalResources,
                "totalServices", totalServices,
                "activeServices", activeServices
        );
    }
}
