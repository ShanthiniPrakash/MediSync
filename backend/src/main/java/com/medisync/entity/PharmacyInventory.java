package com.medisync.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "pharmacy_inventory")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PharmacyInventory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "medicine_id", nullable = false)
    private Medicine medicine;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "hospital_id", nullable = false)
    private Hospital hospital;

    @Column(name = "stock_quantity", nullable = false)
    private int stockQuantity;

    @Column(name = "expiry_date", nullable = false)
    private LocalDate expiryDate;

    @Column(name = "unit_price", nullable = false)
    private double unitPrice;

    @Column(name = "supplier_name", nullable = false)
    private String supplierName;
}
