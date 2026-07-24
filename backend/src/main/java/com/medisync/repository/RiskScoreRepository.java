package com.medisync.repository;

import com.medisync.entity.RiskScore;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RiskScoreRepository extends JpaRepository<RiskScore, Long> {
    List<RiskScore> findByPatientUmrnOrderByCalculatedAtDesc(String umrn);
}
