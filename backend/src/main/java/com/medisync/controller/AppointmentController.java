package com.medisync.controller;

import com.medisync.dto.AppointmentRequest;
import com.medisync.entity.Appointment;
import com.medisync.service.AppointmentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/appointments")
public class AppointmentController {

    @Autowired
    private AppointmentService appointmentService;

    @PostMapping
    public ResponseEntity<Appointment> bookAppointment(@Valid @RequestBody AppointmentRequest request) {
        Appointment response = appointmentService.bookAppointment(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<Appointment> cancelAppointment(@PathVariable("id") Long id) {
        Appointment response = appointmentService.cancelAppointment(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{umrn}")
    public ResponseEntity<List<Appointment>> getPatientAppointments(@PathVariable("umrn") String umrn) {
        List<Appointment> response = appointmentService.getAppointmentsByPatientUmrn(umrn);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<Appointment>> getAllAppointments() {
        return ResponseEntity.ok(appointmentService.getAllAppointments());
    }
}
