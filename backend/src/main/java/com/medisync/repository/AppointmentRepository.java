package com.medisync.repository;

import com.medisync.entity.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByPatientIdOrderByAppointmentDateDesc(Long patientId);
    List<Appointment> findByPatientUmrnOrderByAppointmentDateDesc(String umrn);
    List<Appointment> findByDoctorIdOrderByAppointmentDateDesc(Long doctorId);
}
