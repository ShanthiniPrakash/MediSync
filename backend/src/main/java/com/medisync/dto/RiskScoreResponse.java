package com.medisync.dto;

import lombok.*;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RiskScoreResponse {
    private String patientUmrn;
    private Map<String, Double> riskPercentages;
    private Map<String, String> riskLevels;
    private Map<String, String> explanations;
}
