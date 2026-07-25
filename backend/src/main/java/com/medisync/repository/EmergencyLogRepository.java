package com.medisync.repository;

import com.medisync.entity.EmergencyLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EmergencyLogRepository extends JpaRepository<EmergencyLog, Long> {
    List<EmergencyLog> findAllByOrderByAccessTimeDesc();
    long countByPatientUmrn(String umrn);
}
