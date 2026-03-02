package com.sliit.smartcampus.booking;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {
    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public BookingResponse create(@Valid @RequestBody BookingRequest request) {
        return bookingService.createBooking(request);
    }

    @GetMapping("/user/{userId}")
    public List<BookingResponse> getUserBookings(@PathVariable long userId) {
        return bookingService.getUserBookings(userId);
    }

    @GetMapping("/facility/{facilityId}")
    public List<BookingResponse> getFacilityBookings(@PathVariable long facilityId) {
        return bookingService.getFacilityBookings(facilityId);
    }

    @PutMapping("/{bookingId}/cancel")
    public BookingResponse cancel(@PathVariable long bookingId, @RequestParam long userId) {
        return bookingService.cancelBooking(bookingId, userId);
    }
}
