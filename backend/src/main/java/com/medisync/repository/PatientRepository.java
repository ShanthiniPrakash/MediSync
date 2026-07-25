package com.medisync.repository;

import com.medisync.entity.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> {
    Optional<Patient> findByUmrn(String umrn);
    Optional<Patient> findByUserUsername(String username);
    
    @Query("SELECT p FROM Patient p WHERE " +
           "LOWER(p.umrn) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.mobile) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.name) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Patient> searchPatients(@Param("query") String query);
}
