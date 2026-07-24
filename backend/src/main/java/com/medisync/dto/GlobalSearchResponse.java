package com.medisync.dto;

import com.medisync.entity.Doctor;
import com.medisync.entity.Hospital;
import com.medisync.entity.Patient;
import com.medisync.entity.Medicine;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GlobalSearchResponse {
    private List<Patient> patients;
    private List<Doctor> doctors;
    private List<Medicine> medicines;
    private List<Hospital> hospitals;
}
