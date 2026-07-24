package com.medisync.repository;

import com.medisync.entity.DrugInteraction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface DrugInteractionRepository extends JpaRepository<DrugInteraction, Long> {
    Optional<DrugInteraction> findByDrug1IgnoreCaseAndDrug2IgnoreCase(String drug1, String drug2);
}
