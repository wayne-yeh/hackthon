package com.tar.verification.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tar.verification.dto.TokenMetadata;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

/**
 * Service for calculating and comparing metadata hashes
 */
@Service
public class HashComparatorService {

    private static final Logger logger = LoggerFactory.getLogger(HashComparatorService.class);
    private static final String HASH_ALGORITHM = "SHA-256";

    private final ObjectMapper objectMapper;

    public HashComparatorService() {
        this.objectMapper = new ObjectMapper();
    }

    /**
     * Calculate SHA-256 hash of the metadata JSON
     * 
     * @param metadata Token metadata to hash
     * @return SHA-256 hash as hexadecimal string
     * @throws IllegalArgumentException if metadata is null
     */
    public String calculateHash(TokenMetadata metadata) {
        if (metadata == null) {
            throw new IllegalArgumentException("Metadata cannot be null");
        }

        try {
            String jsonString = objectMapper.writeValueAsString(metadata);
            logger.debug("Calculating hash for metadata JSON: {}", jsonString);

            MessageDigest digest = MessageDigest.getInstance(HASH_ALGORITHM);
            byte[] hash = digest.digest(jsonString.getBytes(StandardCharsets.UTF_8));

            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }

            String result = hexString.toString();
            logger.debug("Calculated hash: {}", result);
            return result;

        } catch (Exception e) {
            logger.error("Error calculating hash for metadata", e);
            throw new RuntimeException("Failed to calculate metadata hash", e);
        }
    }

    /**
     * Compare two hash strings (case-insensitive)
     * 
     * @param hash1 First hash to compare
     * @param hash2 Second hash to compare
     * @return true if hashes match, false otherwise
     * @throws IllegalArgumentException if either hash is null
     */
    public boolean compareHashes(String hash1, String hash2) {
        if (hash1 == null || hash2 == null) {
            throw new IllegalArgumentException("Hashes cannot be null");
        }

        boolean result = hash1.toLowerCase().equals(hash2.toLowerCase());
        logger.debug("Comparing hashes: {} vs {} = {}", hash1, hash2, result);
        return result;
    }

    /**
     * Verify if the calculated hash matches the stored hash
     * 
     * @param metadata   Token metadata to verify
     * @param storedHash Hash stored on-chain
     * @return true if hashes match, false otherwise
     */
    public boolean verifyMetadataHash(TokenMetadata metadata, String storedHash) {
        if (storedHash == null) {
            logger.warn("Stored hash is null, verification failed");
            return false;
        }

        try {
            String calculatedHash = calculateHash(metadata);
            boolean isValid = compareHashes(calculatedHash, storedHash);

            logger.info("Metadata hash verification result: {} (calculated: {}, stored: {})",
                    isValid, calculatedHash, storedHash);

            return isValid;
        } catch (Exception e) {
            logger.error("Error during metadata hash verification", e);
            return false;
        }
    }
}
