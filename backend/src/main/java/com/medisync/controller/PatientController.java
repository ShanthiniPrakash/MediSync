package com.medisync.controller;

import com.medisync.dto.PatientRegisterRequest;
import com.medisync.dto.PatientResponse;
import com.medisync.service.PatientService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/patients")
public class PatientController {

    @Autowired
    private PatientService patientService;

    @PostMapping("/register")
    public ResponseEntity<PatientResponse> registerPatient(@Valid @RequestBody PatientRegisterRequest request) {
        PatientResponse response = patientService.registerPatient(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<PatientResponse>> getAllPatients(@RequestParam(value = "search", required = false) String search) {
        List<PatientResponse> response = patientService.getAllPatients(search);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{umrn}")
    public ResponseEntity<PatientResponse> getPatientByUmrn(@PathVariable("umrn") String umrn) {
        PatientResponse response = patientService.getPatientByUmrn(umrn);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/update")
    public ResponseEntity<PatientResponse> updatePatientProfile(@RequestParam("umrn") String umrn, @Valid @RequestBody PatientRegisterRequest request) {
        PatientResponse response = patientService.updatePatient(umrn, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<Void> deletePatient(@PathVariable("id") Long id) {
        patientService.deletePatient(id);
        return ResponseEntity.noContent().build();
    }
}
