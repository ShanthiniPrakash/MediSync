package com.medisync.repository;

import com.medisync.entity.AiPrediction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AiPredictionRepository extends JpaRepository<AiPrediction, Long> {
    List<AiPrediction> findByPatientUmrnOrderByTimestampDesc(String umrn);
    List<AiPrediction> findByPatientIdOrderByTimestampDesc(Long patientId);
}
