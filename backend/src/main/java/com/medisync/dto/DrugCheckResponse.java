package com.medisync.dto;

import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DrugCheckResponse {
    private boolean safe;
    private List<String> warnings;
    private List<String> alternatives;
}
