package com.medisync.controller;

import com.medisync.dto.GlobalSearchResponse;
import com.medisync.entity.Doctor;
import com.medisync.entity.Hospital;
import com.medisync.entity.Medicine;
import com.medisync.entity.Patient;
import com.medisync.repository.DoctorRepository;
import com.medisync.repository.HospitalRepository;
import com.medisync.repository.MedicineRepository;
import com.medisync.repository.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/search")
public class SearchController {

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private MedicineRepository medicineRepository;

    @Autowired
    private HospitalRepository hospitalRepository;

    @GetMapping
    public ResponseEntity<GlobalSearchResponse> globalSearch(@RequestParam("query") String query) {
        if (query == null || query.trim().isEmpty()) {
            return ResponseEntity.ok(GlobalSearchResponse.builder()
                    .patients(new ArrayList<>())
                    .doctors(new ArrayList<>())
                    .medicines(new ArrayList<>())
                    .hospitals(new ArrayList<>())
                    .build());
        }

        String searchKey = query.trim();

        List<Patient> patients = patientRepository.searchPatients(searchKey);
        
        List<Doctor> doctors = doctorRepository.findByNameContainingIgnoreCase(searchKey);
        List<Doctor> docsBySpec = doctorRepository.findBySpecializationContainingIgnoreCase(searchKey);
        doctors.addAll(docsBySpec);
        doctors = doctors.stream().distinct().collect(Collectors.toList());

        List<Medicine> medicines = medicineRepository.findByNameContainingIgnoreCaseOrGenericNameContainingIgnoreCase(searchKey, searchKey);

        List<Hospital> hospitals = hospitalRepository.findAll().stream()
                .filter(h -> h.getName().toLowerCase().contains(searchKey.toLowerCase()) || 
                             h.getLocation().toLowerCase().contains(searchKey.toLowerCase()))
                .collect(Collectors.toList());

        GlobalSearchResponse response = GlobalSearchResponse.builder()
                .patients(patients)
                .doctors(doctors)
                .medicines(medicines)
                .hospitals(hospitals)
                .build();

        return ResponseEntity.ok(response);
    }
}
