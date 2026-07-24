package com.medisync.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;

@Data
public class PatientRegisterRequest {
    @NotBlank(message = "Name is required")
    private String name;

    @NotNull(message = "Date of Birth is required")
    private LocalDate dob;

    @NotBlank(message = "Gender is required")
    private String gender;

    @NotBlank(message = "Blood Group is required")
    private String bloodGroup;

    @NotBlank(message = "Mobile number is required")
    private String mobile;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    private String address;

    @NotBlank(message = "Emergency Contact is required")
    private String emergencyContact;

    private String insuranceNumber;

    private String allergies;

    private String chronicDiseases;

    private String currentMedications;

    private String previousSurgeries;
}
