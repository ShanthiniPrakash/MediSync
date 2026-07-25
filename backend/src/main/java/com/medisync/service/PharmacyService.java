package com.medisync.service;

import com.medisync.dto.PharmacyInventoryRequest;
import com.medisync.entity.*;
import com.medisync.exception.ResourceNotFoundException;
import com.medisync.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PharmacyService {

    @Autowired
    private PharmacyInventoryRepository inventoryRepository;

    @Autowired
    private MedicineRepository medicineRepository;

    @Autowired
    private HospitalRepository hospitalRepository;

    @Autowired
    private MedicalRecordRepository medicalRecordRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    public List<PharmacyInventory> getInventoryByHospital(Long hospitalId) {
        return inventoryRepository.findByHospitalId(hospitalId);
    }

    public List<PharmacyInventory> searchInventory(Long hospitalId, String query) {
        return inventoryRepository.searchInventory(hospitalId, query);
    }

    public List<PharmacyInventory> getLowStockItems(Long hospitalId) {
        return inventoryRepository.findLowStockItems(hospitalId, 10);
    }

    public List<PharmacyInventory> getExpiringItems(Long hospitalId) {
        return inventoryRepository.findExpiringItems(hospitalId, LocalDate.now().plusDays(30));
    }

    @Transactional
    public PharmacyInventory addInventoryItem(PharmacyInventoryRequest request) {
        Medicine medicine = medicineRepository.findById(request.getMedicineId())
                .orElseThrow(() -> new ResourceNotFoundException("Medicine not found with ID: " + request.getMedicineId()));

        Hospital hospital = hospitalRepository.findById(request.getHospitalId())
                .orElseThrow(() -> new ResourceNotFoundException("Hospital not found with ID: " + request.getHospitalId()));

        PharmacyInventory item = PharmacyInventory.builder()
                .medicine(medicine)
                .hospital(hospital)
                .stockQuantity(request.getStockQuantity())
                .expiryDate(request.getExpiryDate())
                .unitPrice(request.getUnitPrice())
                .supplierName(request.getSupplierName())
                .build();

        return inventoryRepository.save(item);
    }

    @Transactional
    public PharmacyInventory updateInventoryItem(Long id, PharmacyInventoryRequest request) {
        PharmacyInventory item = inventoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory item not found with ID: " + id));

        Medicine medicine = medicineRepository.findById(request.getMedicineId())
                .orElseThrow(() -> new ResourceNotFoundException("Medicine not found with ID: " + request.getMedicineId()));

        item.setMedicine(medicine);
        item.setStockQuantity(request.getStockQuantity());
        item.setExpiryDate(request.getExpiryDate());
        item.setUnitPrice(request.getUnitPrice());
        item.setSupplierName(request.getSupplierName());

        return inventoryRepository.save(item);
    }

    @Transactional
    public void deleteInventoryItem(Long id) {
        PharmacyInventory item = inventoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory item not found with ID: " + id));
        inventoryRepository.delete(item);
    }

    @Transactional
    public void dispenseMedicines(Long recordId, Long medicineId, int quantity) {
        MedicalRecord record = medicalRecordRepository.findById(recordId)
                .orElseThrow(() -> new ResourceNotFoundException("Medical Record not found with ID: " + recordId));

        Long hospitalId = record.getHospital().getId();

        List<PharmacyInventory> inventoryItems = inventoryRepository.findByHospitalId(hospitalId).stream()
                .filter(i -> i.getMedicine().getId().equals(medicineId))
                .collect(Collectors.toList());

        if (inventoryItems.isEmpty()) {
            throw new ResourceNotFoundException("Medicine not available in this hospital's inventory");
        }

        PharmacyInventory item = inventoryItems.get(0);
        if (item.getStockQuantity() < quantity) {
            throw new IllegalArgumentException("Insufficient stock to dispense. Available: " + item.getStockQuantity());
        }

        item.setStockQuantity(item.getStockQuantity() - quantity);
        inventoryRepository.save(item);

        AuditLog auditLog = AuditLog.builder()
                .action("DISPENSE_MEDICINE")
                .performedBy("PHARMACIST")
                .patientId(record.getPatient().getId())
                .details("Dispensed " + quantity + " units of " + item.getMedicine().getName() + " for Patient UMRN: " + record.getPatient().getUmrn())
                .build();
        auditLogRepository.save(auditLog);
    }
}
