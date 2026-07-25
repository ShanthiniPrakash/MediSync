package com.medisync.repository;

import com.medisync.entity.PharmacyInventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface PharmacyInventoryRepository extends JpaRepository<PharmacyInventory, Long> {
    List<PharmacyInventory> findByHospitalId(Long hospitalId);
    
    @Query("SELECT p FROM PharmacyInventory p WHERE p.hospital.id = :hospitalId AND " +
           "(LOWER(p.medicine.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.medicine.genericName) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<PharmacyInventory> searchInventory(@Param("hospitalId") Long hospitalId, @Param("query") String query);

    @Query("SELECT p FROM PharmacyInventory p WHERE p.hospital.id = :hospitalId AND p.stockQuantity < :threshold")
    List<PharmacyInventory> findLowStockItems(@Param("hospitalId") Long hospitalId, @Param("threshold") int threshold);

    @Query("SELECT p FROM PharmacyInventory p WHERE p.hospital.id = :hospitalId AND p.expiryDate <= :expiryDateLimit")
    List<PharmacyInventory> findExpiringItems(@Param("hospitalId") Long hospitalId, @Param("expiryDateLimit") LocalDate expiryDateLimit);
}
