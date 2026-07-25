package com.medisync.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "emergency_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmergencyLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "accessed_by_username", nullable = false)
    private String accessedByUsername;

    @Column(name = "patient_umrn", nullable = false)
    private String patientUmrn;

    @Column(name = "access_time", nullable = false)
    private LocalDateTime accessTime;

    @Column(columnDefinition = "TEXT")
    private String reason;

    @Column(name = "hospital_name")
    private String hospitalName;

    @Column(name = "doctor_name")
    private String doctorName;

    @PrePersist
    protected void onCreate() {
        accessTime = LocalDateTime.now();
    }
}
