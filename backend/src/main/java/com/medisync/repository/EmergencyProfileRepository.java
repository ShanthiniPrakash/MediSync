package com.medisync.repository;

import com.medisync.entity.EmergencyProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface EmergencyProfileRepository extends JpaRepository<EmergencyProfile, Long> {
    Optional<EmergencyProfile> findByPatientUmrn(String umrn);
    Optional<EmergencyProfile> findByPatientId(Long patientId);
}
