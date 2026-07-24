package com.medisync.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "risk_scores")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RiskScore {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @Column(name = "cardiovascular_risk")
    private double cardiovascularRisk;

    @Column(name = "stroke_risk")
    private double strokeRisk;

    @Column(name = "diabetes_risk")
    private double diabetesRisk;

    @Column(name = "kidney_risk")
    private double kidneyRisk;

    @Column(name = "liver_risk")
    private double liverRisk;

    @Column(name = "calculated_at", nullable = false)
    private LocalDateTime calculatedAt;

    @PrePersist
    protected void onCreate() {
        calculatedAt = LocalDateTime.now();
    }
}
