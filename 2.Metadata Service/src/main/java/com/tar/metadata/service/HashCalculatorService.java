package com.tar.metadata.service;

import org.apache.commons.codec.digest.DigestUtils;
import org.springframework.stereotype.Service;

/**
 * Service for calculating SHA-256 hashes
 */
@Service
public class HashCalculatorService {

    /**
     * Calculate SHA-256 hash of a string
     * 
     * @param input the input string
     * @return SHA-256 hash as hexadecimal string
     */
    public String calculateSha256(String input) {
        if (input == null || input.isEmpty()) {
            throw new IllegalArgumentException("Input cannot be null or empty");
        }
        return DigestUtils.sha256Hex(input);
    }

    /**
     * Calculate SHA-256 hash of byte array
     * 
     * @param input the input byte array
     * @return SHA-256 hash as hexadecimal string
     */
    public String calculateSha256(byte[] input) {
        if (input == null || input.length == 0) {
            throw new IllegalArgumentException("Input cannot be null or empty");
        }
        return DigestUtils.sha256Hex(input);
    }
}


