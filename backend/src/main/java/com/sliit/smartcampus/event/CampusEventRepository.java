package com.sliit.smartcampus.event;

import org.springframework.data.jpa.repository.JpaRepository;

public interface CampusEventRepository extends JpaRepository<CampusEvent, Long> {
}
