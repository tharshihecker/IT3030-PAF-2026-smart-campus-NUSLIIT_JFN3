package com.sliit.smartcampus.booking;

import com.sliit.smartcampus.facility.Facility;
import com.sliit.smartcampus.facility.FacilityRepository;
import com.sliit.smartcampus.facility.ResourceStatus;
import com.sliit.smartcampus.user.User;
import com.sliit.smartcampus.user.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;

@Service
public class BookingService {
    private final BookingRepository bookingRepository;
    private final FacilityRepository facilityRepository;
    private final UserRepository userRepository;

    public BookingService(BookingRepository bookingRepository,
                          FacilityRepository facilityRepository,
                          UserRepository userRepository) {
        this.bookingRepository = bookingRepository;
        this.facilityRepository = facilityRepository;
        this.userRepository = userRepository;
    }

    public BookingResponse createBooking(BookingRequest request) {
        Long requestFacilityId = request.getFacilityId();
        if (requestFacilityId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "facilityId is required");
        }
        long facilityId = requestFacilityId;

        Facility facility = facilityRepository.findById(facilityId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Facility not found"));

        if (facility.getStatus() != ResourceStatus.ACTIVE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Facility is not available for booking (status: " + facility.getStatus() + ")");
        }

        Long requestUserId = request.getUserId();
        if (requestUserId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "userId is required");
        }
        long userId = requestUserId;

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (!request.getStartTime().isBefore(request.getEndTime())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Start time must be before end time");
        }

        if (request.getBookingDate().isBefore(LocalDate.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot book for a past date");
        }

        if (request.getStartTime().isBefore(facility.getAvailableFrom()) ||
            request.getEndTime().isAfter(facility.getAvailableTo())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Booking time must be within facility availability: " +
                    facility.getAvailableFrom() + " - " + facility.getAvailableTo());
        }

        if (request.getAttendeeCount() != null && request.getAttendeeCount() > facility.getCapacity()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Attendee count exceeds facility capacity of " + facility.getCapacity());
        }

        List<Booking> conflicts = bookingRepository.findConflictingBookings(
                facilityId, request.getBookingDate(),
                request.getStartTime(), request.getEndTime());
        if (!conflicts.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Time slot conflicts with an existing booking");
        }

        Booking booking = new Booking();
        booking.setFacility(facility);
        booking.setUser(user);
        booking.setBookingDate(request.getBookingDate());
        booking.setStartTime(request.getStartTime());
        booking.setEndTime(request.getEndTime());
        booking.setPurpose(request.getPurpose());
        booking.setNotes(request.getNotes());
        booking.setAttendeeCount(request.getAttendeeCount());
        booking.setStatus(BookingStatus.PENDING);

        return BookingResponse.from(bookingRepository.save(booking));
    }

    public List<BookingResponse> getUserBookings(long userId) {
        return bookingRepository.findByUserIdOrderByBookingDateDescStartTimeDesc(userId)
                .stream().map(BookingResponse::from).toList();
    }

    public List<BookingResponse> getFacilityBookings(long facilityId) {
        return bookingRepository.findByFacilityIdOrderByBookingDateDesc(facilityId)
                .stream().map(BookingResponse::from).toList();
    }

    public List<BookingResponse> getAllBookings() {
        return bookingRepository.findAllByOrderByCreatedAtDesc()
                .stream().map(BookingResponse::from).toList();
    }

    public List<BookingResponse> getBookingsByStatus(BookingStatus status) {
        return bookingRepository.findByStatusOrderByCreatedAtDesc(status)
                .stream().map(BookingResponse::from).toList();
    }

    public BookingResponse cancelBooking(long bookingId, long userId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));

        if (booking.getUser().getId() == null || booking.getUser().getId() != userId) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only cancel your own bookings");
        }

        if (booking.getStatus() == BookingStatus.CANCELLED || booking.getStatus() == BookingStatus.COMPLETED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot cancel a " + booking.getStatus() + " booking");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        return BookingResponse.from(bookingRepository.save(booking));
    }

    public BookingResponse updateBookingStatus(long bookingId, BookingStatus newStatus, String adminRemarks) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));

        booking.setStatus(newStatus);
        if (adminRemarks != null && !adminRemarks.isBlank()) {
            booking.setAdminRemarks(adminRemarks);
        }
        return BookingResponse.from(bookingRepository.save(booking));
    }

    public void deleteBooking(long bookingId) {
        if (!bookingRepository.existsById(bookingId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found");
        }
        bookingRepository.deleteById(bookingId);
    }
}
