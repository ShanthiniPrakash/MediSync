package com.medisync.controller;

import com.medisync.dto.AvailabilityResponse;
import com.medisync.entity.Hospital;
import com.medisync.service.HospitalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/hospitals")
public class HospitalController {

    @Autowired
    private HospitalService hospitalService;

    @GetMapping
    public ResponseEntity<List<Hospital>> getAllHospitals() {
        return ResponseEntity.ok(hospitalService.getAllHospitals());
    }

    @PostMapping
    public ResponseEntity<Hospital> createHospital(@RequestBody Hospital hospital) {
        return ResponseEntity.ok(hospitalService.saveHospital(hospital));
    }

    @GetMapping("/{id}/check-availability")
    public ResponseEntity<AvailabilityResponse> checkAvailability(
            @PathVariable("id") Long hospitalId,
            @RequestParam("resource") String resource,
            @RequestParam(value = "query", required = false) String query,
            @RequestParam(value = "quantity", defaultValue = "1") int quantity) {
        AvailabilityResponse response = hospitalService.checkAvailability(hospitalId, resource, query, quantity);
        return ResponseEntity.ok(response);
    }
}
