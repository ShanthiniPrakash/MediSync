package com.medisync.dto;

import lombok.Data;

@Data
public class EmergencyPriorityRequest {
    private String bloodPressure;
    private int pulse;
    private double temperature;
    private int respiratoryRate;
    private int spo2;
    private int gcs;
    private int bloodSugar;
}
