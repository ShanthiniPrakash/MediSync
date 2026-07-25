package com.medisync.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "medicines")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Medicine {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(name = "generic_name", nullable = false)
    private String genericName;

    @Column(nullable = false)
    private String manufacturer;

    @Column(name = "dosage_form", nullable = false)
    private String dosageForm; // Tablet, Syrup, Injection

    @Column(nullable = false)
    private String strength; // 500mg, 10ml
}
