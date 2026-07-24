package com.medisync.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmergencyPriorityResponse {
    private String classification; // CRITICAL, HIGH, MEDIUM, LOW
    private String colorCode;       // RED, ORANGE, YELLOW, GREEN
    private String reason;
}
