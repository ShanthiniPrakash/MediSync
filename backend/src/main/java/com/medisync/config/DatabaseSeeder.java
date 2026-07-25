package com.medisync.config;

import com.medisync.entity.*;
import com.medisync.repository.*;
import com.medisync.util.QrCodeGenerator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private HospitalRepository hospitalRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private MedicineRepository medicineRepository;

    @Autowired
    private PharmacyInventoryRepository inventoryRepository;

    @Autowired
    private MedicalRecordRepository medicalRecordRepository;

    @Autowired
    private HospitalVisitRepository hospitalVisitRepository;

    @Autowired
    private EmergencyProfileRepository emergencyProfileRepository;

    @Autowired
    private DrugInteractionRepository drugInteractionRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // 1. Seed Hospitals
        if (hospitalRepository.count() == 0) {
            Hospital apex = Hospital.builder()
                    .name("MediSync Apex Hospital")
                    .location("New Delhi, India")
                    .contact("+91 11 2635 1289")
                    .availableBeds(45)
                    .availableIcu(8)
                    .hasMri(true)
                    .build();
            hospitalRepository.save(apex);

            Hospital stJude = Hospital.builder()
                    .name("St. Jude Medical Center")
                    .location("Mumbai, India")
                    .contact("+91 22 2845 7761")
                    .availableBeds(0)  // 0 beds to trigger Availability Finder alternatives
                    .availableIcu(0)   // 0 ICU beds
                    .hasMri(false)      // No MRI
                    .build();
            hospitalRepository.save(stJude);
        }

        List<Hospital> hospitals = hospitalRepository.findAll();
        Hospital hospitalApex = hospitals.stream().filter(h -> h.getName().contains("Apex")).findFirst().orElse(hospitals.get(0));
        Hospital hospitalJude = hospitals.stream().filter(h -> h.getName().contains("Jude")).findFirst().orElse(hospitals.get(0));

        // 2. Seed Departments
        if (departmentRepository.count() == 0) {
            Department cardio = Department.builder().name("Cardiology").hospital(hospitalApex).build();
            Department neuro = Department.builder().name("Neurology").hospital(hospitalApex).build();
            Department genMed = Department.builder().name("General Medicine").hospital(hospitalApex).build();
            departmentRepository.save(cardio);
            departmentRepository.save(neuro);
            departmentRepository.save(genMed);

            Department jCardio = Department.builder().name("Cardiology").hospital(hospitalJude).build();
            Department jGen = Department.builder().name("General Medicine").hospital(hospitalJude).build();
            departmentRepository.save(jCardio);
            departmentRepository.save(jGen);
        }

        List<Department> departments = departmentRepository.findAll();
        Department depCardio = departments.stream().filter(d -> d.getName().equals("Cardiology") && d.getHospital().getId().equals(hospitalApex.getId())).findFirst().orElse(departments.get(0));
        Department depNeuro = departments.stream().filter(d -> d.getName().equals("Neurology")).findFirst().orElse(departments.get(0));

        // 3. Seed Doctors
        if (doctorRepository.count() == 0) {
            Doctor doc1 = Doctor.builder()
                    .name("Dr. A. K. Sen")
                    .specialization("Cardiology")
                    .contact("+91 9988776655")
                    .email("aksen@medisync.com")
                    .hospital(hospitalApex)
                    .department(depCardio)
                    .build();
            doctorRepository.save(doc1);

            Doctor doc2 = Doctor.builder()
                    .name("Dr. Sunita Rao")
                    .specialization("Neurology")
                    .contact("+91 9988776611")
                    .email("sunitarao@medisync.com")
                    .hospital(hospitalApex)
                    .department(depNeuro)
                    .build();
            doctorRepository.save(doc2);
        }

        // 4. Seed Admin
        Optional<User> adminOpt = userRepository.findByUsername("admin@medisync.com");
        if (adminOpt.isEmpty()) {
            User admin = User.builder()
                    .username("admin@medisync.com")
                    .password(passwordEncoder.encode("admin123"))
                    .role("ROLE_ADMIN")
                    .build();
            userRepository.save(admin);
        }

        // 5. Seed Pharmacist
        Optional<User> pharmacyOpt = userRepository.findByUsername("pharmacy@medisync.com");
        if (pharmacyOpt.isEmpty()) {
            User pharmacyUser = User.builder()
                    .username("pharmacy@medisync.com")
                    .password(passwordEncoder.encode("pharmacy123"))
                    .role("ROLE_PHARMACY")
                    .build();
            userRepository.save(pharmacyUser);
        }

        // 6. Seed Sample Patient (Rahul Sharma)
        String sampleUmrn = "UMRN100000000001";
        Optional<Patient> patientOpt = patientRepository.findByUmrn(sampleUmrn);
        if (patientOpt.isEmpty()) {
            User patientUser = User.builder()
                    .username(sampleUmrn)
                    .password(passwordEncoder.encode("15081995")) // DOB: ddMMyyyy
                    .role("ROLE_PATIENT")
                    .build();

            String qrCodeBase64 = QrCodeGenerator.generateQrCodeBase64(sampleUmrn, 250, 250);

            Patient patient = Patient.builder()
                    .user(patientUser)
                    .umrn(sampleUmrn)
                    .name("Rahul Sharma")
                    .dob(LocalDate.of(1995, 8, 15))
                    .gender("Male")
                    .bloodGroup("O+")
                    .mobile("9876543210")
                    .email("rahul.sharma@gmail.com")
                    .address("Flat 102, Green Meadows, Sector 45, Gurgaon")
                    .emergencyContact("Sunita Sharma (+91 9876543211)")
                    .insuranceNumber("INS-9928374")
                    .allergies("Penicillin, Peanuts")
                    .chronicDiseases("Asthma")
                    .currentMedications("Albuterol Inhaler (PRN)")
                    .previousSurgeries("Appendectomy (2018)")
                    .vaccinationHistory("COVID-19 Covaxin (Dose 1 & 2), BCG (Tuberculosis), Hepatitis B")
                    .qrCode(qrCodeBase64)
                    .build();

            Patient savedPatient = patientRepository.save(patient);

            // Save Emergency Profile
            EmergencyProfile emergencyProfile = EmergencyProfile.builder()
                    .patient(savedPatient)
                    .bloodGroup(savedPatient.getBloodGroup())
                    .allergies(savedPatient.getAllergies())
                    .chronicDiseases(savedPatient.getChronicDiseases())
                    .currentMedications(savedPatient.getCurrentMedications())
                    .previousSurgeries(savedPatient.getPreviousSurgeries())
                    .emergencyContact(savedPatient.getEmergencyContact())
                    .build();
            emergencyProfileRepository.save(emergencyProfile);

            // Add medical record and visit
            MedicalRecord record = MedicalRecord.builder()
                    .patient(savedPatient)
                    .hospital(hospitalApex)
                    .visitDate(LocalDate.of(2026, 7, 20))
                    .diagnosis("Acute Bronchitis")
                    .prescription("Amoxicillin 500mg (3x/day for 5 days)\nParacetamol 650mg (PRN for fever)")
                    .labReport("Chest X-Ray: Clear. SpO2: 98%.")
                    .operationNotes("No surgical operations performed.")
                    .doctorNotes("Patient reported chest congestion and mild fever. Prescribed antibiotics. Advised warm water steam inhalation twice daily and bed rest. Reviewed by Dr. A. K. Sen.")
                    .followUpDate(LocalDate.of(2026, 7, 27))
                    .build();
            medicalRecordRepository.save(record);

            HospitalVisit visit = HospitalVisit.builder()
                    .patient(savedPatient)
                    .hospital(hospitalApex)
                    .visitDate(LocalDate.of(2026, 7, 20))
                    .doctorName("Dr. A. K. Sen")
                    .reason("Acute Bronchitis")
                    .build();
            hospitalVisitRepository.save(visit);
        }

        // 7. Seed Medicines
        if (medicineRepository.count() == 0) {
            Medicine med1 = Medicine.builder().name("Paracetamol").genericName("Acetaminophen").manufacturer("GSK").dosageForm("Tablet").strength("650mg").build();
            Medicine med2 = Medicine.builder().name("Amoxicillin").genericName("Amoxicillin Trihydrate").manufacturer("Abbott").dosageForm("Tablet").strength("500mg").build();
            Medicine med3 = Medicine.builder().name("Metformin").genericName("Metformin Hydrochloride").manufacturer("Cipla").dosageForm("Tablet").strength("500mg").build();
            Medicine med4 = Medicine.builder().name("Pantoprazole").genericName("Pantoprazole Sodium").manufacturer("Sun Pharma").dosageForm("Tablet").strength("40mg").build();
            
            medicineRepository.save(med1);
            medicineRepository.save(med2);
            medicineRepository.save(med3);
            medicineRepository.save(med4);
        }

        // 8. Seed Pharmacy Inventory for Apex Hospital
        if (inventoryRepository.count() == 0) {
            List<Medicine> medicines = medicineRepository.findAll();
            
            // Low Stock item (Stock quantity = 4)
            PharmacyInventory item1 = PharmacyInventory.builder()
                    .medicine(medicines.get(0)) // Paracetamol
                    .hospital(hospitalApex)
                    .stockQuantity(150)
                    .expiryDate(LocalDate.now().plusYears(2))
                    .unitPrice(4.50)
                    .supplierName("MedCare Distributors")
                    .build();
            
            // Under threshold (<10) low-stock item
            PharmacyInventory item2 = PharmacyInventory.builder()
                    .medicine(medicines.get(1)) // Amoxicillin
                    .hospital(hospitalApex)
                    .stockQuantity(4)
                    .expiryDate(LocalDate.now().plusYears(1))
                    .unitPrice(15.00)
                    .supplierName("Apex Pharma Traders")
                    .build();

            // Expiring item (Expiring within 30 days)
            PharmacyInventory item3 = PharmacyInventory.builder()
                    .medicine(medicines.get(2)) // Metformin
                    .hospital(hospitalApex)
                    .stockQuantity(200)
                    .expiryDate(LocalDate.now().plusDays(10)) // Expiring in 10 days
                    .unitPrice(7.00)
                    .supplierName("Global Health Suppliers")
                    .build();

            PharmacyInventory item4 = PharmacyInventory.builder()
                    .medicine(medicines.get(3)) // Pantoprazole
                    .hospital(hospitalApex)
                    .stockQuantity(90)
                    .expiryDate(LocalDate.now().plusYears(3))
                    .unitPrice(11.20)
                    .supplierName("MedCare Distributors")
                    .build();

            inventoryRepository.save(item1);
            inventoryRepository.save(item2);
            inventoryRepository.save(item3);
            inventoryRepository.save(item4);
        }

        // 9. Seed Drug Interactions
        if (drugInteractionRepository.count() == 0) {
            drugInteractionRepository.save(DrugInteraction.builder()
                    .drug1("Aspirin")
                    .drug2("Clopidogrel")
                    .severity("WARNING")
                    .interactionDetails("Concurrent use of Aspirin and Clopidogrel significantly increases bleeding risk. Monitor stool/urine color.")
                    .saferAlternative("Suggested Alternative: Monotherapy or proton-pump inhibitor (PPI) co-therapy.")
                    .build());

            drugInteractionRepository.save(DrugInteraction.builder()
                    .drug1("Aspirin")
                    .drug2("Warfarin")
                    .severity("CRITICAL")
                    .interactionDetails("Severe risk of major bleeding and hemorrhage. Dual therapy requires strict INR monitoring.")
                    .saferAlternative("Suggested Alternative: Clopidogrel monotherapy or consult hematology.")
                    .build());
        }
    }
}
