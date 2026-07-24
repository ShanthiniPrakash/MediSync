package com.medisync.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientResponse {
    private Long id;
    private String umrn;
    private String name;
    private LocalDate dob;
    private String gender;
    private String bloodGroup;
    private String mobile;
    private String email;
    private String address;
    private String emergencyContact;
    private String insuranceNumber;
    private String allergies;
    private String chronicDiseases;
    private String currentMedications;
    private String previousSurgeries;
    private String qrCode;
    private LocalDateTime createdAt;
}
