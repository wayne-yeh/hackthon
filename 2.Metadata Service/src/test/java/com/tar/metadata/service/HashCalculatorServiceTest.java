package com.tar.metadata.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for HashCalculatorService
 */
class HashCalculatorServiceTest {

    private HashCalculatorService hashCalculatorService;

    @BeforeEach
    void setUp() {
        hashCalculatorService = new HashCalculatorService();
    }

    @Test
    @DisplayName("Should calculate SHA-256 hash for valid string input")
    void shouldCalculateSha256ForValidString() {
        // Given
        String input = "test data";

        // When
        String hash = hashCalculatorService.calculateSha256(input);

        // Then
        assertNotNull(hash);
        assertEquals(64, hash.length()); // SHA-256 produces 64 character hex string
        assertTrue(hash.matches("[a-f0-9]+")); // Should be hexadecimal
    }

    @Test
    @DisplayName("Should calculate SHA-256 hash for byte array input")
    void shouldCalculateSha256ForByteArray() {
        // Given
        byte[] input = "test data".getBytes();

        // When
        String hash = hashCalculatorService.calculateSha256(input);

        // Then
        assertNotNull(hash);
        assertEquals(64, hash.length());
        assertTrue(hash.matches("[a-f0-9]+"));
    }

    @Test
    @DisplayName("Should produce same hash for same input")
    void shouldProduceSameHashForSameInput() {
        // Given
        String input = "consistent test data";

        // When
        String hash1 = hashCalculatorService.calculateSha256(input);
        String hash2 = hashCalculatorService.calculateSha256(input);

        // Then
        assertEquals(hash1, hash2);
    }

    @Test
    @DisplayName("Should produce different hash for different input")
    void shouldProduceDifferentHashForDifferentInput() {
        // Given
        String input1 = "test data 1";
        String input2 = "test data 2";

        // When
        String hash1 = hashCalculatorService.calculateSha256(input1);
        String hash2 = hashCalculatorService.calculateSha256(input2);

        // Then
        assertNotEquals(hash1, hash2);
    }

    @Test
    @DisplayName("Should throw exception for null string input")
    void shouldThrowExceptionForNullStringInput() {
        // When & Then
        assertThrows(IllegalArgumentException.class, () -> {
            hashCalculatorService.calculateSha256((String) null);
        });
    }

    @Test
    @DisplayName("Should throw exception for empty string input")
    void shouldThrowExceptionForEmptyStringInput() {
        // When & Then
        assertThrows(IllegalArgumentException.class, () -> {
            hashCalculatorService.calculateSha256("");
        });
    }

    @Test
    @DisplayName("Should throw exception for null byte array input")
    void shouldThrowExceptionForNullByteArrayInput() {
        // When & Then
        assertThrows(IllegalArgumentException.class, () -> {
            hashCalculatorService.calculateSha256((byte[]) null);
        });
    }

    @Test
    @DisplayName("Should throw exception for empty byte array input")
    void shouldThrowExceptionForEmptyByteArrayInput() {
        // When & Then
        assertThrows(IllegalArgumentException.class, () -> {
            hashCalculatorService.calculateSha256(new byte[0]);
        });
    }
}

