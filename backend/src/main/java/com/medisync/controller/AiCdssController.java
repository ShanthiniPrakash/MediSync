package com.medisync.controller;

import com.medisync.dto.*;
import com.medisync.entity.Recommendation;
import com.medisync.service.AiCdssService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
public class AiCdssController {

    @Autowired
    private AiCdssService aiCdssService;

    @GetMapping("/patient/{umrn}/summary")
    public ResponseEntity<AiSummaryResponse> getPatientSummary(@PathVariable("umrn") String umrn) {
        return ResponseEntity.ok(aiCdssService.generatePatientSummary(umrn));
    }

    @GetMapping("/patient/{umrn}/risk")
    public ResponseEntity<RiskScoreResponse> getPatientRisks(@PathVariable("umrn") String umrn) {
        return ResponseEntity.ok(aiCdssService.predictDiseaseRisks(umrn));
    }

    @PostMapping("/drug-check")
    public ResponseEntity<DrugCheckResponse> checkDrugInteractions(@RequestBody DrugCheckRequest request) {
        return ResponseEntity.ok(aiCdssService.checkDrugInteractions(request));
    }

    @PostMapping("/recommendation")
    public ResponseEntity<Recommendation> generateRecommendation(@RequestBody RecommendationRequest request) {
        return ResponseEntity.ok(aiCdssService.generateRecommendation(request));
    }

    @PostMapping("/emergency-priority")
    public ResponseEntity<EmergencyPriorityResponse> classifyEmergencyPriority(@RequestBody EmergencyPriorityRequest request) {
        return ResponseEntity.ok(aiCdssService.classifyEmergencyPriority(request));
    }
}
