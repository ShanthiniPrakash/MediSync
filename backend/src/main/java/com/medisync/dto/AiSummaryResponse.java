package com.medisync.dto;

import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiSummaryResponse {
    private String summaryText;
    private List<String> keyHighlights;
    private String lastUpdated;
}
