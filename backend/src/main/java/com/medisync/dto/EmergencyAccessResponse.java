package com.medisync.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmergencyAccessResponse {
    private String name;
    private int age;
    private String bloodGroup;
    private String allergies;
    private String chronicDiseases;
    private String currentMedications;
    private String previousSurgeries;
    private String emergencyContact;
    private String umrn;
}
