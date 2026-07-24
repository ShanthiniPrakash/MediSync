package com.medisync.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "recommendations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Recommendation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @Column(nullable = false)
    private String diagnosis;

    @Column(name = "suggested_medicines", columnDefinition = "TEXT")
    private String suggestedMedicines;

    @Column(name = "suggested_tests", columnDefinition = "TEXT")
    private String suggestedTests;

    @Column(name = "lifestyle_advice", columnDefinition = "TEXT")
    private String lifestyleAdvice;

    @Column(name = "follow_up_days")
    private int followUpDays;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @PrePersist
    protected void onCreate() {
        timestamp = LocalDateTime.now();
    }
}
