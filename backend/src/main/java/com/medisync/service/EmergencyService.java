package com.medisync.service;

import com.medisync.dto.EmergencyAccessResponse;
import com.medisync.entity.EmergencyLog;
import com.medisync.entity.EmergencyProfile;
import com.medisync.entity.Patient;
import com.medisync.exception.ResourceNotFoundException;
import com.medisync.repository.EmergencyLogRepository;
import com.medisync.repository.EmergencyProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Period;
import java.time.LocalDate;
import java.util.List;

@Service
public class EmergencyService {

    @Autowired
    private EmergencyProfileRepository emergencyProfileRepository;

    @Autowired
    private EmergencyLogRepository emergencyLogRepository;

    @Transactional
    public EmergencyAccessResponse getEmergencyProfileByUmrn(String umrn, String reason, String doctor, String hospital) {
        EmergencyProfile profile = emergencyProfileRepository.findByPatientUmrn(umrn)
                .orElseThrow(() -> new ResourceNotFoundException("Emergency profile not found for UMRN: " + umrn));

        Patient patient = profile.getPatient();
        int age = Period.between(patient.getDob(), LocalDate.now()).getYears();

        String actor = SecurityContextHolder.getContext().getAuthentication() != null 
                ? SecurityContextHolder.getContext().getAuthentication().getName() 
                : "EMERGENCY_DEPT";

        EmergencyLog log = EmergencyLog.builder()
                .accessedByUsername(actor)
                .patientUmrn(umrn)
                .reason(reason != null && !reason.trim().isEmpty() ? reason : "Critical Emergency Access")
                .hospitalName(hospital != null && !hospital.trim().isEmpty() ? hospital : "MediSync Apex Hospital")
                .doctorName(doctor != null && !doctor.trim().isEmpty() ? doctor : "Trauma Duty Doctor")
                .build();
        
        emergencyLogRepository.save(log);

        return EmergencyAccessResponse.builder()
                .name(patient.getName())
                .age(age)
                .bloodGroup(profile.getBloodGroup())
                .allergies(profile.getAllergies())
                .chronicDiseases(profile.getChronicDiseases())
                .currentMedications(profile.getCurrentMedications())
                .previousSurgeries(profile.getPreviousSurgeries())
                .emergencyContact(profile.getEmergencyContact())
                .umrn(umrn)
                .build();
    }

    public List<EmergencyLog> getEmergencyLogs() {
        return emergencyLogRepository.findAllByOrderByAccessTimeDesc();
    }

    public long getEmergencyAccessCount() {
        return emergencyLogRepository.count();
    }
}
