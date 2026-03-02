package com.sliit.smartcampus.booking;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByUserIdOrderByBookingDateDescStartTimeDesc(long userId);
    List<Booking> findByFacilityIdOrderByBookingDateDesc(long facilityId);
    List<Booking> findByStatusOrderByCreatedAtDesc(BookingStatus status);
    List<Booking> findAllByOrderByCreatedAtDesc();

    long countByStatus(BookingStatus status);

    @Query("SELECT b FROM Booking b WHERE b.facility.id = :facilityId AND b.bookingDate = :date " +
           "AND b.status IN ('PENDING','APPROVED') " +
           "AND ((b.startTime < :endTime AND b.endTime > :startTime))")
    List<Booking> findConflictingBookings(
            @Param("facilityId") long facilityId,
            @Param("date") LocalDate date,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime
    );

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.bookingDate = :date AND b.status IN ('PENDING','APPROVED')")
    long countBookingsForDate(@Param("date") LocalDate date);

    @Query("SELECT b FROM Booking b WHERE b.bookingDate >= :startDate AND b.bookingDate <= :endDate ORDER BY b.bookingDate, b.startTime")
    List<Booking> findBookingsInRange(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}
