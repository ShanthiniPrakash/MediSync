package com.medisync.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "hospitals")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Hospital {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String location;

    @Column(nullable = false)
    private String contact;

    @Column(name = "available_beds", nullable = false)
    private int availableBeds;

    @Column(name = "available_icu", nullable = false)
    private int availableIcu;

    @Column(name = "has_mri", nullable = false)
    private boolean hasMri;
}
