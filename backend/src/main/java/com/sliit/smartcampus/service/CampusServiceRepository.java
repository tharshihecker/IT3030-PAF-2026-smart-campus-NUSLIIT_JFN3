package com.sliit.smartcampus.service;

import org.springframework.data.jpa.repository.JpaRepository;

public interface CampusServiceRepository extends JpaRepository<CampusServiceItem, Long> {
    long countByStatusIgnoreCase(String status);
}
