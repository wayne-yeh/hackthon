package com.tar.verification.service;

import com.tar.verification.client.BlockchainClient;
import com.tar.verification.client.MetadataClient;
import com.tar.verification.dto.TokenMetadata;
import com.tar.verification.dto.VerificationResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

/**
 * Unit tests for VerificationService
 */
@ExtendWith(MockitoExtension.class)
class VerificationServiceTest {

    @Mock
    private BlockchainClient blockchainClient;

    @Mock
    private MetadataClient metadataClient;

    @Mock
    private HashComparatorService hashComparatorService;

    private VerificationService verificationService;

    @BeforeEach
    void setUp() {
        verificationService = new VerificationService(blockchainClient, metadataClient, hashComparatorService);
    }

    @Test
    void verifyToken_WithValidToken_ShouldReturnValidResponse() {
        // Given
        Long tokenId = 123L;
        String owner = "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6";
        String tokenURI = "https://api.example.com/metadata/123";
        String storedHash = "a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456";
        boolean revoked = false;

        TokenMetadata metadata = createTestMetadata();

        when(blockchainClient.getTokenOwner(tokenId)).thenReturn(owner);
        when(blockchainClient.getTokenURI(tokenId)).thenReturn(tokenURI);
        when(blockchainClient.getStoredHash(tokenId)).thenReturn(storedHash);
        when(blockchainClient.isTokenRevoked(tokenId)).thenReturn(revoked);
        when(metadataClient.fetchMetadata(tokenURI)).thenReturn(metadata);
        when(hashComparatorService.verifyMetadataHash(metadata, storedHash)).thenReturn(true);

        // When
        VerificationResponse response = verificationService.verifyToken(tokenId);

        // Then
        assertNotNull(response);
        assertTrue(response.isValid());
        assertEquals(owner, response.getOwner());
        assertEquals(tokenURI, response.getTokenURI());
        assertEquals(revoked, response.isRevoked());
        assertEquals(tokenId, response.getTokenId());
        assertTrue(response.getReasons().isEmpty());

        verify(blockchainClient).getTokenOwner(tokenId);
        verify(blockchainClient).getTokenURI(tokenId);
        verify(blockchainClient).getStoredHash(tokenId);
        verify(blockchainClient).isTokenRevoked(tokenId);
        verify(metadataClient).fetchMetadata(tokenURI);
        verify(hashComparatorService).verifyMetadataHash(metadata, storedHash);
    }

    @Test
    void verifyToken_WithRevokedToken_ShouldReturnInvalidResponse() {
        // Given
        Long tokenId = 123L;
        String owner = "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6";
        String tokenURI = "https://api.example.com/metadata/123";
        String storedHash = "a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456";
        boolean revoked = true;

        TokenMetadata metadata = createTestMetadata();

        when(blockchainClient.getTokenOwner(tokenId)).thenReturn(owner);
        when(blockchainClient.getTokenURI(tokenId)).thenReturn(tokenURI);
        when(blockchainClient.getStoredHash(tokenId)).thenReturn(storedHash);
        when(blockchainClient.isTokenRevoked(tokenId)).thenReturn(revoked);
        when(metadataClient.fetchMetadata(tokenURI)).thenReturn(metadata);
        when(hashComparatorService.verifyMetadataHash(metadata, storedHash)).thenReturn(true);

        // When
        VerificationResponse response = verificationService.verifyToken(tokenId);

        // Then
        assertNotNull(response);
        assertFalse(response.isValid());
        assertTrue(response.getReasons().contains("Token is revoked"));
        assertEquals(owner, response.getOwner());
        assertEquals(tokenURI, response.getTokenURI());
        assertEquals(revoked, response.isRevoked());
        assertEquals(tokenId, response.getTokenId());
    }

    @Test
    void verifyToken_WithHashMismatch_ShouldReturnInvalidResponse() {
        // Given
        Long tokenId = 123L;
        String owner = "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6";
        String tokenURI = "https://api.example.com/metadata/123";
        String storedHash = "a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456";
        boolean revoked = false;

        TokenMetadata metadata = createTestMetadata();

        when(blockchainClient.getTokenOwner(tokenId)).thenReturn(owner);
        when(blockchainClient.getTokenURI(tokenId)).thenReturn(tokenURI);
        when(blockchainClient.getStoredHash(tokenId)).thenReturn(storedHash);
        when(blockchainClient.isTokenRevoked(tokenId)).thenReturn(revoked);
        when(metadataClient.fetchMetadata(tokenURI)).thenReturn(metadata);
        when(hashComparatorService.verifyMetadataHash(metadata, storedHash)).thenReturn(false);

        // When
        VerificationResponse response = verificationService.verifyToken(tokenId);

        // Then
        assertNotNull(response);
        assertFalse(response.isValid());
        assertTrue(response.getReasons().contains("Metadata hash mismatch"));
        assertEquals(owner, response.getOwner());
        assertEquals(tokenURI, response.getTokenURI());
        assertEquals(revoked, response.isRevoked());
        assertEquals(tokenId, response.getTokenId());
    }

    @Test
    void verifyToken_WithMultipleIssues_ShouldReturnInvalidResponseWithMultipleReasons() {
        // Given
        Long tokenId = 123L;
        String owner = "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6";
        String tokenURI = "https://api.example.com/metadata/123";
        String storedHash = "a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456";
        boolean revoked = true;

        TokenMetadata metadata = createTestMetadata();

        when(blockchainClient.getTokenOwner(tokenId)).thenReturn(owner);
        when(blockchainClient.getTokenURI(tokenId)).thenReturn(tokenURI);
        when(blockchainClient.getStoredHash(tokenId)).thenReturn(storedHash);
        when(blockchainClient.isTokenRevoked(tokenId)).thenReturn(revoked);
        when(metadataClient.fetchMetadata(tokenURI)).thenReturn(metadata);
        when(hashComparatorService.verifyMetadataHash(metadata, storedHash)).thenReturn(false);

        // When
        VerificationResponse response = verificationService.verifyToken(tokenId);

        // Then
        assertNotNull(response);
        assertFalse(response.isValid());
        assertTrue(response.getReasons().contains("Token is revoked"));
        assertTrue(response.getReasons().contains("Metadata hash mismatch"));
        assertEquals(2, response.getReasons().size());
    }

    @Test
    void verifyToken_WithBlockchainError_ShouldThrowException() {
        // Given
        Long tokenId = 123L;
        when(blockchainClient.getTokenOwner(tokenId))
                .thenThrow(new RuntimeException("Blockchain connection failed"));

        // When & Then
        assertThrows(RuntimeException.class, () -> {
            verificationService.verifyToken(tokenId);
        });
    }

    @Test
    void verifyToken_WithMetadataFetchError_ShouldReturnInvalidResponse() {
        // Given
        Long tokenId = 123L;
        String owner = "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6";
        String tokenURI = "https://api.example.com/metadata/123";
        String storedHash = "a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456";
        boolean revoked = false;

        when(blockchainClient.getTokenOwner(tokenId)).thenReturn(owner);
        when(blockchainClient.getTokenURI(tokenId)).thenReturn(tokenURI);
        when(blockchainClient.getStoredHash(tokenId)).thenReturn(storedHash);
        when(blockchainClient.isTokenRevoked(tokenId)).thenReturn(revoked);
        when(metadataClient.fetchMetadata(tokenURI))
                .thenThrow(new RuntimeException("Failed to fetch metadata"));

        // When
        VerificationResponse response = verificationService.verifyToken(tokenId);

        // Then
        assertNotNull(response);
        assertFalse(response.isValid());
        assertTrue(response.getReasons().contains("Failed to fetch metadata"));
        assertEquals(owner, response.getOwner());
        assertEquals(tokenURI, response.getTokenURI());
        assertEquals(revoked, response.isRevoked());
        assertEquals(tokenId, response.getTokenId());
    }

    @Test
    void verifyToken_WithNullTokenId_ShouldThrowException() {
        // When & Then
        assertThrows(IllegalArgumentException.class, () -> {
            verificationService.verifyToken(null);
        });
    }

    @Test
    void verifyToken_WithNegativeTokenId_ShouldThrowException() {
        // When & Then
        assertThrows(IllegalArgumentException.class, () -> {
            verificationService.verifyToken(-1L);
        });
    }

    private TokenMetadata createTestMetadata() {
        TokenMetadata metadata = new TokenMetadata();
        metadata.setName("Test Asset Receipt");
        metadata.setDescription("Test description");
        metadata.setImage("https://example.com/image.png");
        metadata.setSerialNumber("TAR-2024-001");
        metadata.setIssuer("Test Issuer");
        metadata.setIssueDate("2024-01-01");
        return metadata;
    }
}
