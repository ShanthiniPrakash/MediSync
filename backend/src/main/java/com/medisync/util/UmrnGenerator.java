package com.medisync.util;

import java.util.Random;

public class UmrnGenerator {
    private static final Random random = new Random();

    public static String generateUmrn() {
        // Generates a 12-digit numeric string prefixed by UMRN (e.g., UMRN847293847261)
        long number = 100000000000L + (long)(random.nextDouble() * 899999999999L);
        return "UMRN" + number;
    }
}
