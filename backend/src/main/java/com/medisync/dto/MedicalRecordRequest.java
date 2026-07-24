package com.medisync.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;

@Data
public class MedicalRecordRequest {
    @NotNull(message = "Patient ID is required")
    private Long patientId;

    @NotNull(message = "Hospital ID is required")
    private Long hospitalId;

    @NotNull(message = "Visit Date is required")
    private LocalDate visitDate;

    @NotBlank(message = "Diagnosis is required")
    private String diagnosis;

    private String prescription;
    
    private String labReport;
    
    private String operationNotes;
    
    private String doctorNotes;
    
    private LocalDate followUpDate;
}
