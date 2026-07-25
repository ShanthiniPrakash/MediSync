package com.medisync.repository;

import com.medisync.entity.HospitalVisit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface HospitalVisitRepository extends JpaRepository<HospitalVisit, Long> {
    List<HospitalVisit> findByPatientIdOrderByVisitDateDesc(Long patientId);
    List<HospitalVisit> findByPatientUmrnOrderByVisitDateDesc(String umrn);
}
