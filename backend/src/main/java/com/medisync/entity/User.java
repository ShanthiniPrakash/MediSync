package com.medisync.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username; // UMRN for Patient, Email for Admin

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String role; // ROLE_PATIENT, ROLE_ADMIN
}
