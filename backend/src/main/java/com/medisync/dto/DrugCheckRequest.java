package com.medisync.dto;

import lombok.Data;
import java.util.List;

@Data
public class DrugCheckRequest {
    private String patientUmrn;
    private List<String> prescribedMedicines;
}
