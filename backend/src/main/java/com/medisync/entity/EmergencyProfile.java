package com.medisync.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "emergency_profiles")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmergencyProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @Column(name = "blood_group", nullable = false)
    private String bloodGroup;

    @Column(columnDefinition = "TEXT")
    private String allergies;

    @Column(name = "chronic_diseases", columnDefinition = "TEXT")
    private String chronicDiseases;

    @Column(name = "current_medications", columnDefinition = "TEXT")
    private String currentMedications;

    @Column(name = "previous_surgeries", columnDefinition = "TEXT")
    private String previousSurgeries;

    @Column(name = "emergency_contact", nullable = false)
    private String emergencyContact;
}
