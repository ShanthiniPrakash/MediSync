package com.medisync.dto;

import com.medisync.entity.Hospital;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AvailabilityResponse {
    private boolean available;
    private String requestedResource; // e.g. Bed, ICU, MRI, Doctor, Medicine
    private int requestedQuantity;
    private Hospital primaryHospital;
    private List<Hospital> suggestedAlternativeHospitals;
}
