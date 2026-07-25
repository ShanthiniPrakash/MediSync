package com.medisync.service;

import com.medisync.dto.MedicalRecordRequest;
import com.medisync.entity.AuditLog;
import com.medisync.entity.Hospital;
import com.medisync.entity.HospitalVisit;
import com.medisync.entity.MedicalRecord;
import com.medisync.entity.Patient;
import com.medisync.exception.ResourceNotFoundException;
import com.medisync.repository.AuditLogRepository;
import com.medisync.repository.HospitalRepository;
import com.medisync.repository.HospitalVisitRepository;
import com.medisync.repository.MedicalRecordRepository;
import com.medisync.repository.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class MedicalRecordService {

    @Autowired
    private MedicalRecordRepository medicalRecordRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private HospitalRepository hospitalRepository;

    @Autowired
    private HospitalVisitRepository hospitalVisitRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Transactional
    public MedicalRecord createMedicalRecord(MedicalRecordRequest request) {
        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with ID: " + request.getPatientId()));

        Hospital hospital = hospitalRepository.findById(request.getHospitalId())
                .orElseThrow(() -> new ResourceNotFoundException("Hospital not found with ID: " + request.getHospitalId()));

        MedicalRecord record = MedicalRecord.builder()
                .patient(patient)
                .hospital(hospital)
                .visitDate(request.getVisitDate())
                .diagnosis(request.getDiagnosis())
                .prescription(request.getPrescription())
                .labReport(request.getLabReport())
                .operationNotes(request.getOperationNotes())
                .doctorNotes(request.getDoctorNotes())
                .followUpDate(request.getFollowUpDate())
                .build();

        MedicalRecord savedRecord = medicalRecordRepository.save(record);

        // Automatically record a hospital visit for this event
        String doctorName = "Dr. Consultant";
        if (request.getDoctorNotes() != null && request.getDoctorNotes().contains("Dr.")) {
            doctorName = extractDoctorName(request.getDoctorNotes());
        }

        HospitalVisit visit = HospitalVisit.builder()
                .patient(patient)
                .hospital(hospital)
                .visitDate(request.getVisitDate())
                .doctorName(doctorName)
                .reason(request.getDiagnosis())
                .build();
        hospitalVisitRepository.save(visit);

        // Audit Log
        String actor = SecurityContextHolder.getContext().getAuthentication() != null 
                ? SecurityContextHolder.getContext().getAuthentication().getName() 
                : "SYSTEM";

        AuditLog auditLog = AuditLog.builder()
                .action("ADD_MEDICAL_RECORD")
                .performedBy(actor)
                .patientId(patient.getId())
                .details("Added medical record for patient UMRN: " + patient.getUmrn() + ". Diagnosis: " + request.getDiagnosis())
                .build();
        auditLogRepository.save(auditLog);

        return savedRecord;
    }

    @Transactional
    public MedicalRecord updateMedicalRecord(Long id, MedicalRecordRequest request) {
        MedicalRecord record = medicalRecordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medical Record not found with ID: " + id));

        record.setDiagnosis(request.getDiagnosis());
        record.setPrescription(request.getPrescription());
        record.setLabReport(request.getLabReport());
        record.setOperationNotes(request.getOperationNotes());
        record.setDoctorNotes(request.getDoctorNotes());
        record.setFollowUpDate(request.getFollowUpDate());
        record.setVisitDate(request.getVisitDate());

        MedicalRecord savedRecord = medicalRecordRepository.save(record);

        // Audit Log
        String actor = SecurityContextHolder.getContext().getAuthentication() != null 
                ? SecurityContextHolder.getContext().getAuthentication().getName() 
                : "SYSTEM";

        AuditLog auditLog = AuditLog.builder()
                .action("UPDATE_MEDICAL_RECORD")
                .performedBy(actor)
                .patientId(record.getPatient().getId())
                .details("Updated medical record ID: " + id + " for patient UMRN: " + record.getPatient().getUmrn())
                .build();
        auditLogRepository.save(auditLog);

        return savedRecord;
    }

    public List<MedicalRecord> getMedicalRecordsByPatientUmrn(String umrn) {
        return medicalRecordRepository.findByPatientUmrnOrderByVisitDateDesc(umrn);
    }

    public List<HospitalVisit> getVisitsByPatientUmrn(String umrn) {
        return hospitalVisitRepository.findByPatientUmrnOrderByVisitDateDesc(umrn);
    }

    private String extractDoctorName(String doctorNotes) {
        int idx = doctorNotes.indexOf("Dr.");
        if (idx != -1) {
            int spaceIdx = doctorNotes.indexOf(" ", idx + 4);
            if (spaceIdx != -1) {
                return doctorNotes.substring(idx, spaceIdx);
            }
            return doctorNotes.substring(idx);
        }
        return "Dr. Consultant";
    }
}
