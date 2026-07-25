package com.medisync.service;

import com.medisync.dto.AvailabilityResponse;
import com.medisync.entity.Doctor;
import com.medisync.entity.Hospital;
import com.medisync.entity.PharmacyInventory;
import com.medisync.exception.ResourceNotFoundException;
import com.medisync.repository.DoctorRepository;
import com.medisync.repository.HospitalRepository;
import com.medisync.repository.PharmacyInventoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class HospitalService {

    @Autowired
    private HospitalRepository hospitalRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private PharmacyInventoryRepository pharmacyInventoryRepository;

    public List<Hospital> getAllHospitals() {
        return hospitalRepository.findAll();
    }

    public Hospital getHospitalById(Long id) {
        return hospitalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hospital not found with ID: " + id));
    }

    public Hospital saveHospital(Hospital hospital) {
        return hospitalRepository.save(hospital);
    }

    public AvailabilityResponse checkAvailability(Long hospitalId, String resource, String query, int quantity) {
        Hospital primary = getHospitalById(hospitalId);
        boolean available = false;
        List<Hospital> alternatives = new ArrayList<>();

        if ("Bed".equalsIgnoreCase(resource)) {
            available = primary.getAvailableBeds() >= quantity;
            if (!available) {
                alternatives = hospitalRepository.findAll().stream()
                        .filter(h -> !h.getId().equals(hospitalId) && h.getAvailableBeds() >= quantity)
                        .collect(Collectors.toList());
            }
        } else if ("ICU".equalsIgnoreCase(resource)) {
            available = primary.getAvailableIcu() >= quantity;
            if (!available) {
                alternatives = hospitalRepository.findAll().stream()
                        .filter(h -> !h.getId().equals(hospitalId) && h.getAvailableIcu() >= quantity)
                        .collect(Collectors.toList());
            }
        } else if ("MRI".equalsIgnoreCase(resource)) {
            available = primary.isHasMri();
            if (!available) {
                alternatives = hospitalRepository.findAll().stream()
                        .filter(h -> !h.getId().equals(hospitalId) && h.isHasMri())
                        .collect(Collectors.toList());
            }
        } else if ("Doctor".equalsIgnoreCase(resource)) {
            List<Doctor> primaryDocs = doctorRepository.findByHospitalId(hospitalId).stream()
                    .filter(d -> d.getSpecialization().equalsIgnoreCase(query))
                    .collect(Collectors.toList());
            available = !primaryDocs.isEmpty();
            if (!available) {
                List<Doctor> allDocs = doctorRepository.findBySpecializationContainingIgnoreCase(query);
                alternatives = allDocs.stream()
                        .map(Doctor::getHospital)
                        .distinct()
                        .filter(h -> !h.getId().equals(hospitalId))
                        .collect(Collectors.toList());
            }
        } else if ("Medicine".equalsIgnoreCase(resource)) {
            List<PharmacyInventory> primaryInv = pharmacyInventoryRepository.findByHospitalId(hospitalId).stream()
                    .filter(i -> i.getMedicine().getName().equalsIgnoreCase(query) && i.getStockQuantity() >= quantity)
                    .collect(Collectors.toList());
            available = !primaryInv.isEmpty();
            if (!available) {
                List<PharmacyInventory> allInv = pharmacyInventoryRepository.findAll().stream()
                        .filter(i -> i.getMedicine().getName().equalsIgnoreCase(query) && i.getStockQuantity() >= quantity)
                        .collect(Collectors.toList());
                alternatives = allInv.stream()
                        .map(PharmacyInventory::getHospital)
                        .distinct()
                        .filter(h -> !h.getId().equals(hospitalId))
                        .collect(Collectors.toList());
            }
        }

        return AvailabilityResponse.builder()
                .available(available)
                .requestedResource(resource)
                .requestedQuantity(quantity)
                .primaryHospital(primary)
                .suggestedAlternativeHospitals(alternatives)
                .build();
    }
}
