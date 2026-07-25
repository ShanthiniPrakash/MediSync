package com.medisync.controller;

import com.medisync.dto.EmergencyAccessResponse;
import com.medisync.entity.EmergencyLog;
import com.medisync.service.EmergencyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/emergency")
public class EmergencyController {

    @Autowired
    private EmergencyService emergencyService;

    @GetMapping("/{umrn}")
    public ResponseEntity<EmergencyAccessResponse> getEmergencyProfile(
            @PathVariable("umrn") String umrn,
            @RequestParam(value = "reason", required = false) String reason,
            @RequestParam(value = "doctor", required = false) String doctor,
            @RequestParam(value = "hospital", required = false) String hospital) {
        EmergencyAccessResponse response = emergencyService.getEmergencyProfileByUmrn(umrn, reason, doctor, hospital);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/logs")
    public ResponseEntity<List<EmergencyLog>> getEmergencyLogs() {
        List<EmergencyLog> response = emergencyService.getEmergencyLogs();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/stats/count")
    public ResponseEntity<Long> getEmergencyAccessCount() {
        long count = emergencyService.getEmergencyAccessCount();
        return ResponseEntity.ok(count);
    }
}
