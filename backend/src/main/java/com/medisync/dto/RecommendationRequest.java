package com.medisync.dto;

import lombok.Data;

@Data
public class RecommendationRequest {
    private String patientUmrn;
    private String diagnosis;
    private String symptoms;
}
