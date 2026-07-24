package com.medisync.service;

import com.medisync.dto.*;
import com.medisync.entity.*;
import com.medisync.exception.ResourceNotFoundException;
import com.medisync.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.Period;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AiCdssService {

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private MedicalRecordRepository medicalRecordRepository;

    @Autowired
    private DrugInteractionRepository drugInteractionRepository;

    @Autowired
    private AiPredictionRepository aiPredictionRepository;

    @Autowired
    private RecommendationRepository recommendationRepository;

    @Autowired
    private RiskScoreRepository riskScoreRepository;

    public AiSummaryResponse generatePatientSummary(String umrn) {
        Patient patient = patientRepository.findByUmrn(umrn)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with UMRN: " + umrn));

        int age = Period.between(patient.getDob(), LocalDate.now()).getYears();
        
        StringBuilder summary = new StringBuilder();
        summary.append(patient.getName()).append(" is a ").append(age).append("-year-old ").append(patient.getGender().toLowerCase()).append(". ");
        
        if (patient.getChronicDiseases() != null && !patient.getChronicDiseases().isEmpty()) {
            summary.append("Diagnosed with chronic ").append(patient.getChronicDiseases()).append(". ");
        } else {
            summary.append("No chronic diseases documented. ");
        }

        if (patient.getAllergies() != null && !patient.getAllergies().isEmpty()) {
            summary.append("Allergic to ").append(patient.getAllergies()).append(" (contraindicated). ");
        } else {
            summary.append("No known allergies reported. ");
        }

        if (patient.getCurrentMedications() != null && !patient.getCurrentMedications().isEmpty()) {
            summary.append("Currently taking: ").append(patient.getCurrentMedications().replaceAll("\\r?\\n", ", ")).append(". ");
        }

        if (patient.getPreviousSurgeries() != null && !patient.getPreviousSurgeries().isEmpty()) {
            summary.append("Surgical history includes ").append(patient.getPreviousSurgeries()).append(". ");
        }

        List<String> highlights = new ArrayList<>();
        if (patient.getAllergies() != null && !patient.getAllergies().isEmpty()) {
            highlights.add("Contraindication: Allergic to " + patient.getAllergies());
        }
        if (patient.getChronicDiseases() != null && patient.getChronicDiseases().toLowerCase().contains("asthma")) {
            highlights.add("High Risk: Avoid Non-Selective Beta Blockers due to reactive airway status.");
        }
        if (patient.getChronicDiseases() != null && patient.getChronicDiseases().toLowerCase().contains("hypertension")) {
            highlights.add("Hypertension monitor: target BP < 130/80.");
        }

        return AiSummaryResponse.builder()
                .summaryText(summary.toString())
                .keyHighlights(highlights)
                .lastUpdated(LocalDateTime.now().toString())
                .build();
    }

    @Transactional
    public RiskScoreResponse predictDiseaseRisks(String umrn) {
        Patient patient = patientRepository.findByUmrn(umrn)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with UMRN: " + umrn));

        int age = Period.between(patient.getDob(), LocalDate.now()).getYears();
        String chronic = patient.getChronicDiseases() != null ? patient.getChronicDiseases().toLowerCase() : "";

        // Calculate heart attack risk
        double heartRisk = 10.0;
        if (chronic.contains("diabetes")) heartRisk += 15.0;
        if (chronic.contains("hypertension") || chronic.contains("heart")) heartRisk += 20.0;
        if (age > 50) heartRisk += 15.0;

        // Calculate stroke risk
        double strokeRisk = 5.0;
        if (chronic.contains("hypertension")) strokeRisk += 25.0;
        if (age > 60) strokeRisk += 15.0;

        // Calculate diabetes risk
        double diabetesRisk = 12.0;
        if (chronic.contains("hypertension")) diabetesRisk += 15.0;
        if (age > 45) diabetesRisk += 10.0;
        if (chronic.contains("obesity")) diabetesRisk += 20.0;

        // Calculate kidney risk
        double kidneyRisk = 8.0;
        if (chronic.contains("diabetes")) kidneyRisk += 20.0;
        if (chronic.contains("hypertension")) kidneyRisk += 10.0;
        if (age > 55) kidneyRisk += 12.0;

        // Calculate liver risk
        double liverRisk = 5.0;
        if (age > 65) liverRisk += 5.0;

        Map<String, Double> riskPercentages = new HashMap<>();
        riskPercentages.put("HEART_ATTACK", Math.min(heartRisk, 95.0));
        riskPercentages.put("STROKE", Math.min(strokeRisk, 95.0));
        riskPercentages.put("DIABETES", Math.min(diabetesRisk, 95.0));
        riskPercentages.put("KIDNEY", Math.min(kidneyRisk, 95.0));
        riskPercentages.put("LIVER", Math.min(liverRisk, 95.0));

        Map<String, String> riskLevels = new HashMap<>();
        Map<String, String> explanations = new HashMap<>();

        for (Map.Entry<String, Double> entry : riskPercentages.entrySet()) {
            double val = entry.getValue();
            String type = entry.getKey();
            String level = val < 20.0 ? "LOW" : val <= 50.0 ? "MEDIUM" : "HIGH";
            riskLevels.put(type, level);

            String exp = "Standard risk based on age.";
            if ("HEART_ATTACK".equals(type) && val > 20.0) {
                exp = "Risk elevated due to age (" + age + ") and presence of " + (chronic.isEmpty() ? "cardiac parameters" : chronic) + ".";
            } else if ("STROKE".equals(type) && val > 20.0) {
                exp = "Risk increased due to hypertensive profile.";
            } else if ("DIABETES".equals(type) && val > 20.0) {
                exp = "Risk elevated. Monitor fasting blood sugars.";
            } else if ("KIDNEY".equals(type) && val > 20.0) {
                exp = "Elevated risk. Monitor GFR and microalbuminuria.";
            }
            explanations.put(type, exp);

            // Audit Save AiPrediction
            AiPrediction pred = AiPrediction.builder()
                    .patient(patient)
                    .predictionType(type)
                    .riskPercentage(val)
                    .riskLevel(level)
                    .explanation(exp)
                    .build();
            aiPredictionRepository.save(pred);
        }

        // Save composite RiskScore
        RiskScore rScore = RiskScore.builder()
                .patient(patient)
                .cardiovascularRisk(riskPercentages.get("HEART_ATTACK"))
                .strokeRisk(riskPercentages.get("STROKE"))
                .diabetesRisk(riskPercentages.get("DIABETES"))
                .kidneyRisk(riskPercentages.get("KIDNEY"))
                .liverRisk(riskPercentages.get("LIVER"))
                .build();
        riskScoreRepository.save(rScore);

        return RiskScoreResponse.builder()
                .patientUmrn(umrn)
                .riskPercentages(riskPercentages)
                .riskLevels(riskLevels)
                .explanations(explanations)
                .build();
    }

    public DrugCheckResponse checkDrugInteractions(DrugCheckRequest request) {
        Patient patient = patientRepository.findByUmrn(request.getPatientUmrn())
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));

        List<String> warnings = new ArrayList<>();
        List<String> alternatives = new ArrayList<>();
        boolean safe = true;

        String allergiesStr = patient.getAllergies() != null ? patient.getAllergies().toLowerCase() : "";
        String chronicStr = patient.getChronicDiseases() != null ? patient.getChronicDiseases().toLowerCase() : "";
        String currentMedsStr = patient.getCurrentMedications() != null ? patient.getCurrentMedications().toLowerCase() : "";

        for (String newMed : request.getPrescribedMedicines()) {
            String medLower = newMed.toLowerCase().trim();

            // 1. Check Allergies (e.g. Penicillin allergy vs Amoxicillin prescription)
            if (!allergiesStr.isEmpty()) {
                if (allergiesStr.contains("penicillin") && 
                    (medLower.contains("amoxicillin") || medLower.contains("penicillin") || medLower.contains("ampicillin") || medLower.contains("mox"))) {
                    safe = false;
                    warnings.add("⚠ ALLERGY ALERT: Patient is allergic to Penicillin. Prescribed beta-lactam drug: " + newMed);
                    alternatives.add("Suggested Allergy Alternative for " + newMed + ": Erythromycin 250mg or Azithromycin 500mg");
                } else if (allergiesStr.contains(medLower)) {
                    safe = false;
                    warnings.add("⚠ ALLERGY ALERT: Patient has documented allergy contraindicating: " + newMed);
                }
            }

            // 2. Check Duplicate Medication
            if (!currentMedsStr.isEmpty() && currentMedsStr.contains(medLower)) {
                safe = false;
                warnings.add("⚠ DUPLICATE MEDICATION: Patient is already taking: " + newMed);
            }

            // 3. Chronic disease contraindications (e.g. Asthma vs NSAIDs like Aspirin/Ibuprofen)
            if (chronicStr.contains("asthma") && 
                (medLower.contains("aspirin") || medLower.contains("ibuprofen") || medLower.contains("naproxen"))) {
                safe = false;
                warnings.add("⚠ DISEASE CONTRAINDICATION: NSAIDs like " + newMed + " can trigger severe bronchospasms in patients with chronic Asthma.");
                alternatives.add("Suggested Safe Alternative: Paracetamol 650mg (for pain/fever relief)");
            }

            // 4. Drug-to-Drug Interactions in Database
            for (String currentMed : currentMedsStr.split("\\r?\\n|,")) {
                String curMedClean = currentMed.replaceAll("\\(.*\\)", "").trim().toLowerCase();
                if (curMedClean.isEmpty()) continue;

                Optional<DrugInteraction> diOpt = drugInteractionRepository.findByDrug1IgnoreCaseAndDrug2IgnoreCase(newMed, curMedClean);
                if (diOpt.isEmpty()) {
                    diOpt = drugInteractionRepository.findByDrug1IgnoreCaseAndDrug2IgnoreCase(curMedClean, newMed);
                }

                if (diOpt.isPresent()) {
                    safe = false;
                    DrugInteraction di = diOpt.get();
                    warnings.add("⚠ DANGEROUS INTERACTION: " + newMed + " interacts with current " + currentMed.trim() + " (" + di.getSeverity() + "). " + di.getInteractionDetails());
                    if (di.getSaferAlternative() != null) {
                        alternatives.add(di.getSaferAlternative());
                    }
                }
            }
        }

        return DrugCheckResponse.builder()
                .safe(safe)
                .warnings(warnings)
                .alternatives(alternatives)
                .build();
    }

    @Transactional
    public Recommendation generateRecommendation(RecommendationRequest request) {
        Patient patient = patientRepository.findByUmrn(request.getPatientUmrn())
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));

        String diag = request.getDiagnosis() != null ? request.getDiagnosis().toLowerCase() : "";
        
        String meds;
        String tests;
        String lifestyle;
        int followUp;

        if (diag.contains("bronchitis")) {
            meds = "Levofloxacin 500mg (Once daily for 5 days)\nCough Expectorant (10ml twice daily)";
            tests = "Sputum Culture, Repeat Chest X-Ray";
            lifestyle = "Steam inhalation, keep hydrated, avoid exposure to cold air/pollutants";
            followUp = 7;
        } else if (diag.contains("asthma")) {
            meds = "Fluticasone/Salmeterol Inhaler (1 puff twice daily)\nPrednisolone 10mg (Once daily for 5 days)";
            tests = "Spirometry Pulmonary Function Test";
            lifestyle = "Monitor PEF daily, keep emergency albuterol inhaler ready, avoid dust mites";
            followUp = 5;
        } else if (diag.contains("hypertension")) {
            meds = "Amlodipine 5mg (Once daily)\nLisinopril 10mg (Once daily)";
            tests = "Basic Metabolic Panel (BMP), Serum Creatinine, ECG";
            lifestyle = "DASH diet (low sodium), daily 30 min cardiovascular walking, limit alcohol";
            followUp = 14;
        } else {
            meds = "Symptomatic medicines, Vitamin C / Zinc supplementation";
            tests = "Complete Blood Count (CBC)";
            lifestyle = "Adequate rest, increase oral fluid intake";
            followUp = 7;
        }

        Recommendation rec = Recommendation.builder()
                .patient(patient)
                .diagnosis(request.getDiagnosis())
                .suggestedMedicines(meds)
                .suggestedTests(tests)
                .lifestyleAdvice(lifestyle)
                .followUpDays(followUp)
                .build();

        return recommendationRepository.save(rec);
    }

    public EmergencyPriorityResponse classifyEmergencyPriority(EmergencyPriorityRequest request) {
        // Glasgow Coma Scale range: 3-15
        int gcs = request.getGcs() > 0 ? request.getGcs() : 15;
        int spo2 = request.getSpo2() > 0 ? request.getSpo2() : 100;
        int rr = request.getRespiratoryRate() > 0 ? request.getRespiratoryRate() : 16;
        int hr = request.getPulse() > 0 ? request.getPulse() : 72;

        if (spo2 < 90 || gcs <= 8 || rr < 8 || rr > 30) {
            return EmergencyPriorityResponse.builder()
                    .classification("CRITICAL")
                    .colorCode("RED")
                    .reason("Patient is in severe clinical distress: SpO2 of " + spo2 + "% (<90%) or GCS score of " + gcs + " (<=8) indicating respiratory failure or comatose neurological state.")
                    .build();
        }

        if (spo2 < 94 || gcs <= 12 || hr > 120 || hr < 50) {
            return EmergencyPriorityResponse.builder()
                    .classification("HIGH PRIORITY")
                    .colorCode("ORANGE")
                    .reason("Acutely abnormal parameters: SpO2 of " + spo2 + "% (<94%) or heart rate of " + hr + " bpm (tachy/bradycardia) warrants prompt physician review.")
                    .build();
        }

        if (spo2 <= 96 || request.getBloodSugar() > 250 || request.getBloodSugar() < 70) {
            return EmergencyPriorityResponse.builder()
                    .classification("MEDIUM PRIORITY")
                    .colorCode("YELLOW")
                    .reason("Mild physiological deviation: blood sugar of " + request.getBloodSugar() + " mg/dL or borderline oxygenation. Monitor vitals closely.")
                    .build();
        }

        return EmergencyPriorityResponse.builder()
                .classification("LOW PRIORITY")
                .colorCode("GREEN")
                .reason("All vital signs and neurological scores reside within stable physiological baselines.")
                .build();
    }
}
