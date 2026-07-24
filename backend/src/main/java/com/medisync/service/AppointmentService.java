package com.medisync.service;

import com.medisync.dto.AppointmentRequest;
import com.medisync.entity.*;
import com.medisync.exception.ResourceNotFoundException;
import com.medisync.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AppointmentService {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Transactional
    public Appointment bookAppointment(AppointmentRequest request) {
        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with ID: " + request.getPatientId()));

        Doctor doctor = doctorRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with ID: " + request.getDoctorId()));

        Appointment appointment = Appointment.builder()
                .patient(patient)
                .doctor(doctor)
                .appointmentDate(request.getAppointmentDate())
                .status("SCHEDULED")
                .reason(request.getReason())
                .build();

        Appointment saved = appointmentRepository.save(appointment);

        // Add Notification
        Notification notification = Notification.builder()
                .userId(patient.getUser().getId())
                .message("Appointment booked with " + doctor.getName() + " on " + request.getAppointmentDate().toString() + " (" + doctor.getSpecialization() + ")")
                .type("APPOINTMENT")
                .build();
        notificationRepository.save(notification);

        // Audit Log
        String actor = SecurityContextHolder.getContext().getAuthentication() != null 
                ? SecurityContextHolder.getContext().getAuthentication().getName() 
                : "SYSTEM";
        
        AuditLog auditLog = AuditLog.builder()
                .action("BOOK_APPOINTMENT")
                .performedBy(actor)
                .patientId(patient.getId())
                .details("Booked appointment ID: " + saved.getId() + " with Doctor: " + doctor.getName())
                .build();
        auditLogRepository.save(auditLog);

        return saved;
    }

    @Transactional
    public Appointment cancelAppointment(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with ID: " + id));

        appointment.setStatus("CANCELLED");
        Appointment saved = appointmentRepository.save(appointment);

        // Add Notification
        Notification notification = Notification.builder()
                .userId(appointment.getPatient().getUser().getId())
                .message("Your appointment with " + appointment.getDoctor().getName() + " on " + appointment.getAppointmentDate().toString() + " was cancelled.")
                .type("ALERT")
                .build();
        notificationRepository.save(notification);

        // Audit Log
        String actor = SecurityContextHolder.getContext().getAuthentication() != null 
                ? SecurityContextHolder.getContext().getAuthentication().getName() 
                : "SYSTEM";
        
        AuditLog auditLog = AuditLog.builder()
                .action("CANCEL_APPOINTMENT")
                .performedBy(actor)
                .patientId(appointment.getPatient().getId())
                .details("Cancelled appointment ID: " + id)
                .build();
        auditLogRepository.save(auditLog);

        return saved;
    }

    public List<Appointment> getAppointmentsByPatientUmrn(String umrn) {
        return appointmentRepository.findByPatientUmrnOrderByAppointmentDateDesc(umrn);
    }

    public List<Appointment> getAllAppointments() {
        return appointmentRepository.findAll();
    }
}
