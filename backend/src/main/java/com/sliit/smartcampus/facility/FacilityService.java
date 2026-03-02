package com.sliit.smartcampus.facility;

import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
public class FacilityService {
    private final FacilityRepository facilityRepository;

    public FacilityService(FacilityRepository facilityRepository) {
        this.facilityRepository = facilityRepository;
    }

    public List<FacilityResponse> search(FacilityFilter filter, String sortBy, String sortDir) {
        Sort.Direction direction = "desc".equalsIgnoreCase(sortDir) ? Sort.Direction.DESC : Sort.Direction.ASC;
        String safeSortField = allowedSortField(sortBy);
        Sort sort = Sort.by(direction, safeSortField);

        return facilityRepository.findAll(buildSpecification(filter), sort)
                .stream()
                .map(FacilityResponse::from)
                .toList();
    }

    public FacilityResponse getById(long id) {
        return facilityRepository.findById(id)
                .map(FacilityResponse::from)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Facility not found"));
    }

    public FacilityResponse create(FacilityRequest request) {
        validateAvailabilityWindow(request);
        Facility facility = new Facility();
        applyRequest(facility, request);
        return FacilityResponse.from(facilityRepository.save(facility));
    }

    public FacilityResponse update(long id, FacilityRequest request) {
        validateAvailabilityWindow(request);
        Facility facility = facilityRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Facility not found"));
        applyRequest(facility, request);
        return FacilityResponse.from(facilityRepository.save(facility));
    }

    public void delete(long id) {
        if (!facilityRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Facility not found");
        }
        facilityRepository.deleteById(id);
    }

    private Specification<Facility> buildSpecification(FacilityFilter filter) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (filter.keyword() != null && !filter.keyword().isBlank()) {
                String keyword = "%" + filter.keyword().trim().toLowerCase(Locale.ROOT) + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("name")), keyword),
                        cb.like(cb.lower(root.get("description")), keyword)
                ));
            }

            if (filter.type() != null) {
                predicates.add(cb.equal(root.get("type"), filter.type()));
            }

            if (filter.minCapacity() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("capacity"), filter.minCapacity()));
            }

            if (filter.maxCapacity() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("capacity"), filter.maxCapacity()));
            }

            if (filter.location() != null && !filter.location().isBlank()) {
                String location = "%" + filter.location().trim().toLowerCase(Locale.ROOT) + "%";
                predicates.add(cb.like(cb.lower(root.get("location")), location));
            }

            if (filter.status() != null) {
                predicates.add(cb.equal(root.get("status"), filter.status()));
            }

            return cb.and(predicates.toArray(Predicate[]::new));
        };
    }

    private String allowedSortField(String sortBy) {
        if (sortBy == null || sortBy.isBlank()) {
            return "name";
        }

        return switch (sortBy) {
            case "name", "capacity", "location", "type", "status" -> sortBy;
            default -> "name";
        };
    }

    private void applyRequest(Facility facility, FacilityRequest request) {
        facility.setName(request.getName().trim());
        facility.setType(request.getType());
        facility.setCapacity(request.getCapacity());
        facility.setLocation(request.getLocation().trim());
        facility.setAvailableFrom(request.getAvailableFrom());
        facility.setAvailableTo(request.getAvailableTo());
        facility.setStatus(request.getStatus());
        facility.setDescription(request.getDescription().trim());
    }

    private void validateAvailabilityWindow(FacilityRequest request) {
        if (!request.getAvailableFrom().isBefore(request.getAvailableTo())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "availableFrom must be before availableTo"
            );
        }
    }
}
