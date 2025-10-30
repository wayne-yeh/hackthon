package com.tar.verification.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tar.verification.dto.TokenMetadata;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for HashComparatorService
 */
@ExtendWith(MockitoExtension.class)
class HashComparatorServiceTest {

    @InjectMocks
    private HashComparatorService hashComparatorService;

    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
    }

    @Test
    void calculateHash_ShouldReturnCorrectSHA256Hash() throws Exception {
        // Given
        TokenMetadata metadata = createTestMetadata();
        String expectedJson = objectMapper.writeValueAsString(metadata);
        String expectedHash = calculateSHA256(expectedJson);

        // When
        String actualHash = hashComparatorService.calculateHash(metadata);

        // Then
        assertEquals(expectedHash, actualHash);
        assertNotNull(actualHash);
        assertEquals(64, actualHash.length()); // SHA256 produces 64 character hex string
    }

    @Test
    void calculateHash_WithNullMetadata_ShouldThrowException() {
        // When & Then
        assertThrows(IllegalArgumentException.class, () -> {
            hashComparatorService.calculateHash(null);
        });
    }

    @Test
    void calculateHash_WithEmptyMetadata_ShouldReturnValidHash() throws Exception {
        // Given
        TokenMetadata emptyMetadata = new TokenMetadata();

        // When
        String hash = hashComparatorService.calculateHash(emptyMetadata);

        // Then
        assertNotNull(hash);
        assertEquals(64, hash.length());
    }

    @Test
    void calculateHash_WithComplexAttributes_ShouldReturnConsistentHash() throws Exception {
        // Given
        TokenMetadata metadata = createTestMetadataWithComplexAttributes();

        // When
        String hash1 = hashComparatorService.calculateHash(metadata);
        String hash2 = hashComparatorService.calculateHash(metadata);

        // Then
        assertEquals(hash1, hash2);
        assertNotNull(hash1);
    }

    @Test
    void compareHashes_WithMatchingHashes_ShouldReturnTrue() {
        // Given
        String hash1 = "a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456";
        String hash2 = "a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456";

        // When
        boolean result = hashComparatorService.compareHashes(hash1, hash2);

        // Then
        assertTrue(result);
    }

    @Test
    void compareHashes_WithDifferentHashes_ShouldReturnFalse() {
        // Given
        String hash1 = "a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456";
        String hash2 = "b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef1234567";

        // When
        boolean result = hashComparatorService.compareHashes(hash1, hash2);

        // Then
        assertFalse(result);
    }

    @Test
    void compareHashes_WithNullHashes_ShouldThrowException() {
        // When & Then
        assertThrows(IllegalArgumentException.class, () -> {
            hashComparatorService.compareHashes(null, "validhash");
        });

        assertThrows(IllegalArgumentException.class, () -> {
            hashComparatorService.compareHashes("validhash", null);
        });
    }

    @Test
    void compareHashes_CaseInsensitive_ShouldReturnTrue() {
        // Given
        String hash1 = "a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456";
        String hash2 = "A1B2C3D4E5F6789012345678901234567890ABCDEF1234567890ABCDEF123456";

        // When
        boolean result = hashComparatorService.compareHashes(hash1, hash2);

        // Then
        assertTrue(result);
    }

    private TokenMetadata createTestMetadata() {
        TokenMetadata metadata = new TokenMetadata();
        metadata.setName("Test Asset Receipt");
        metadata.setDescription("Test description");
        metadata.setImage("https://example.com/image.png");
        metadata.setSerialNumber("TAR-2024-001");
        metadata.setIssuer("Test Issuer");
        metadata.setIssueDate("2024-01-01");

        Map<String, Object> attributes = new HashMap<>();
        attributes.put("propertyType", "Commercial");
        attributes.put("location", "Taipei");
        metadata.setAttributes(attributes);

        return metadata;
    }

    private TokenMetadata createTestMetadataWithComplexAttributes() {
        TokenMetadata metadata = new TokenMetadata();
        metadata.setName("Complex Asset Receipt");
        metadata.setDescription("Complex description with special characters: 中文測試");
        metadata.setImage("https://example.com/complex-image.png");
        metadata.setSerialNumber("TAR-2024-COMPLEX-001");
        metadata.setIssuer("Complex Issuer Ltd.");
        metadata.setIssueDate("2024-01-01T10:30:00Z");

        Map<String, Object> complexAttributes = new HashMap<>();
        complexAttributes.put("propertyType", "Residential");
        complexAttributes.put("location", "台北市信義區");
        complexAttributes.put("area", 100.5);
        complexAttributes.put("floors", 15);

        Map<String, Object> nestedAttributes = new HashMap<>();
        nestedAttributes.put("building", "信義大樓");
        nestedAttributes.put("unit", "15F-01");
        complexAttributes.put("details", nestedAttributes);

        metadata.setAttributes(complexAttributes);

        return metadata;
    }

    private String calculateSHA256(String input) throws NoSuchAlgorithmException {
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
        StringBuilder hexString = new StringBuilder();
        for (byte b : hash) {
            String hex = Integer.toHexString(0xff & b);
            if (hex.length() == 1) {
                hexString.append('0');
            }
            hexString.append(hex);
        }
        return hexString.toString();
    }
}
