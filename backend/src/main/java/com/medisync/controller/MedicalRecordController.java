package com.medisync.controller;

import com.medisync.dto.MedicalRecordRequest;
import com.medisync.entity.HospitalVisit;
import com.medisync.entity.MedicalRecord;
import com.medisync.service.MedicalRecordService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/medical-records")
public class MedicalRecordController {

    @Autowired
    private MedicalRecordService medicalRecordService;

    @PostMapping
    public ResponseEntity<MedicalRecord> createMedicalRecord(@Valid @RequestBody MedicalRecordRequest request) {
        MedicalRecord response = medicalRecordService.createMedicalRecord(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<MedicalRecord> updateMedicalRecord(@PathVariable("id") Long id, @Valid @RequestBody MedicalRecordRequest request) {
        MedicalRecord response = medicalRecordService.updateMedicalRecord(id, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{umrn}")
    public ResponseEntity<List<MedicalRecord>> getMedicalRecordsByPatientUmrn(@PathVariable("umrn") String umrn) {
        List<MedicalRecord> response = medicalRecordService.getMedicalRecordsByPatientUmrn(umrn);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{umrn}/visits")
    public ResponseEntity<List<HospitalVisit>> getVisitsByPatientUmrn(@PathVariable("umrn") String umrn) {
        List<HospitalVisit> response = medicalRecordService.getVisitsByPatientUmrn(umrn);
        return ResponseEntity.ok(response);
    }
}
