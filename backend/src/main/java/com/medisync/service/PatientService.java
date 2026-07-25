package com.medisync.service;

import com.medisync.dto.PatientRegisterRequest;
import com.medisync.dto.PatientResponse;
import com.medisync.entity.AuditLog;
import com.medisync.entity.EmergencyProfile;
import com.medisync.entity.Patient;
import com.medisync.entity.User;
import com.medisync.exception.ResourceNotFoundException;
import com.medisync.repository.AuditLogRepository;
import com.medisync.repository.EmergencyProfileRepository;
import com.medisync.repository.PatientRepository;
import com.medisync.repository.UserRepository;
import com.medisync.util.QrCodeGenerator;
import com.medisync.util.UmrnGenerator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class PatientService {

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmergencyProfileRepository emergencyProfileRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Transactional
    public PatientResponse registerPatient(PatientRegisterRequest request) {
        // Generate UMRN
        String umrn = UmrnGenerator.generateUmrn();
        while (patientRepository.findByUmrn(umrn).isPresent()) {
            umrn = UmrnGenerator.generateUmrn();
        }

        // Generate QR Code containing UMRN
        String qrCodeBase64;
        try {
            qrCodeBase64 = QrCodeGenerator.generateQrCodeBase64(umrn, 250, 250);
        } catch (Exception e) {
            qrCodeBase64 = null;
        }

        // Create User (username = UMRN, default password = dob as ddMMyyyy)
        String rawPassword = request.getDob().format(DateTimeFormatter.ofPattern("ddMMyyyy"));
        User user = User.builder()
                .username(umrn)
                .password(passwordEncoder.encode(rawPassword))
                .role("ROLE_PATIENT")
                .build();

        // Create Patient
        Patient patient = Patient.builder()
                .user(user)
                .umrn(umrn)
                .name(request.getName())
                .dob(request.getDob())
                .gender(request.getGender())
                .bloodGroup(request.getBloodGroup())
                .mobile(request.getMobile())
                .email(request.getEmail())
                .address(request.getAddress())
                .emergencyContact(request.getEmergencyContact())
                .insuranceNumber(request.getInsuranceNumber())
                .allergies(request.getAllergies())
                .chronicDiseases(request.getChronicDiseases())
                .currentMedications(request.getCurrentMedications())
                .previousSurgeries(request.getPreviousSurgeries())
                .qrCode(qrCodeBase64)
                .build();

        Patient savedPatient = patientRepository.save(patient);

        // Create Emergency Profile
        EmergencyProfile emergencyProfile = EmergencyProfile.builder()
                .patient(savedPatient)
                .bloodGroup(savedPatient.getBloodGroup())
                .allergies(savedPatient.getAllergies())
                .chronicDiseases(savedPatient.getChronicDiseases())
                .currentMedications(savedPatient.getCurrentMedications())
                .previousSurgeries(savedPatient.getPreviousSurgeries())
                .emergencyContact(savedPatient.getEmergencyContact())
                .build();

        emergencyProfileRepository.save(emergencyProfile);

        // Audit Log
        String actor = SecurityContextHolder.getContext().getAuthentication() != null 
                ? SecurityContextHolder.getContext().getAuthentication().getName() 
                : "SYSTEM";
        
        AuditLog auditLog = AuditLog.builder()
                .action("REGISTER_PATIENT")
                .performedBy(actor)
                .patientId(savedPatient.getId())
                .details("Registered patient with UMRN: " + umrn + ". Password is DOB in ddMMyyyy format.")
                .build();
        auditLogRepository.save(auditLog);

        return mapToResponse(savedPatient);
    }

    @Transactional
    public PatientResponse updatePatient(String umrn, PatientRegisterRequest request) {
        Patient patient = patientRepository.findByUmrn(umrn)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with UMRN: " + umrn));

        patient.setName(request.getName());
        patient.setDob(request.getDob());
        patient.setGender(request.getGender());
        patient.setBloodGroup(request.getBloodGroup());
        patient.setMobile(request.getMobile());
        patient.setEmail(request.getEmail());
        patient.setAddress(request.getAddress());
        patient.setEmergencyContact(request.getEmergencyContact());
        patient.setInsuranceNumber(request.getInsuranceNumber());
        patient.setAllergies(request.getAllergies());
        patient.setChronicDiseases(request.getChronicDiseases());
        patient.setCurrentMedications(request.getCurrentMedications());
        patient.setPreviousSurgeries(request.getPreviousSurgeries());

        Patient savedPatient = patientRepository.save(patient);

        // Update Emergency Profile
        Optional<EmergencyProfile> epOpt = emergencyProfileRepository.findByPatientId(savedPatient.getId());
        EmergencyProfile ep = epOpt.orElseGet(() -> EmergencyProfile.builder().patient(savedPatient).build());
        ep.setBloodGroup(savedPatient.getBloodGroup());
        ep.setAllergies(savedPatient.getAllergies());
        ep.setChronicDiseases(savedPatient.getChronicDiseases());
        ep.setCurrentMedications(savedPatient.getCurrentMedications());
        ep.setPreviousSurgeries(savedPatient.getPreviousSurgeries());
        ep.setEmergencyContact(savedPatient.getEmergencyContact());
        emergencyProfileRepository.save(ep);

        // Audit Log
        String actor = SecurityContextHolder.getContext().getAuthentication() != null 
                ? SecurityContextHolder.getContext().getAuthentication().getName() 
                : "SYSTEM";
        
        AuditLog auditLog = AuditLog.builder()
                .action("UPDATE_PROFILE")
                .performedBy(actor)
                .patientId(savedPatient.getId())
                .details("Updated profile for patient UMRN: " + umrn)
                .build();
        auditLogRepository.save(auditLog);

        return mapToResponse(savedPatient);
    }

    public PatientResponse getPatientByUmrn(String umrn) {
        Patient patient = patientRepository.findByUmrn(umrn)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with UMRN: " + umrn));
        return mapToResponse(patient);
    }

    public List<PatientResponse> getAllPatients(String search) {
        List<Patient> patients;
        if (search != null && !search.trim().isEmpty()) {
            patients = patientRepository.searchPatients(search);
        } else {
            patients = patientRepository.findAll();
        }
        return patients.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional
    public void deletePatient(Long id) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with ID: " + id));
        
        // Remove emergency profile first if exists
        emergencyProfileRepository.findByPatientId(id).ifPresent(emergencyProfileRepository::delete);
        
        patientRepository.delete(patient);

        // Audit Log
        String actor = SecurityContextHolder.getContext().getAuthentication() != null 
                ? SecurityContextHolder.getContext().getAuthentication().getName() 
                : "SYSTEM";
        
        AuditLog auditLog = AuditLog.builder()
                .action("DELETE_PATIENT")
                .performedBy(actor)
                .patientId(id)
                .details("Deleted patient with UMRN: " + patient.getUmrn())
                .build();
        auditLogRepository.save(auditLog);
    }

    private PatientResponse mapToResponse(Patient patient) {
        return PatientResponse.builder()
                .id(patient.getId())
                .umrn(patient.getUmrn())
                .name(patient.getName())
                .dob(patient.getDob())
                .gender(patient.getGender())
                .bloodGroup(patient.getBloodGroup())
                .mobile(patient.getMobile())
                .email(patient.getEmail())
                .address(patient.getAddress())
                .emergencyContact(patient.getEmergencyContact())
                .insuranceNumber(patient.getInsuranceNumber())
                .allergies(patient.getAllergies())
                .chronicDiseases(patient.getChronicDiseases())
                .currentMedications(patient.getCurrentMedications())
                .previousSurgeries(patient.getPreviousSurgeries())
                .qrCode(patient.getQrCode())
                .createdAt(patient.getCreatedAt())
                .build();
    }
}
