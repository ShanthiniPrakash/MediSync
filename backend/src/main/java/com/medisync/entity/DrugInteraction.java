package com.medisync.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "drug_interactions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DrugInteraction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String drug1;

    @Column(nullable = false)
    private String drug2;

    @Column(nullable = false)
    private String severity; // CRITICAL, WARNING, ADVISORY

    @Column(name = "interaction_details", columnDefinition = "TEXT", nullable = false)
    private String interactionDetails;

    @Column(name = "safer_alternative")
    private String saferAlternative;
}
