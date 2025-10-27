package com.tar.verification.client;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.core.methods.response.EthCall;

import java.math.BigInteger;
import java.util.concurrent.CompletableFuture;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit tests for BlockchainClient
 */
@ExtendWith(MockitoExtension.class)
class BlockchainClientTest {

    @Mock
    private Web3j web3j;

    private BlockchainClient blockchainClient;

    @BeforeEach
    void setUp() {
        blockchainClient = new BlockchainClient(web3j, "0x5FbDB2315678afecb367f032d93F642f64180aa3");
    }

    @Test
    void getTokenOwner_WithValidTokenId_ShouldReturnOwnerAddress() throws Exception {
        // Given
        Long tokenId = 123L;
        String expectedOwner = "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6";

        EthCall mockResponse = mock(EthCall.class);
        when(mockResponse.getValue()).thenReturn(expectedOwner);
        when(web3j.ethCall(any(), any()).sendAsync()).thenReturn(CompletableFuture.completedFuture(mockResponse));

        // When
        String actualOwner = blockchainClient.getTokenOwner(tokenId);

        // Then
        assertEquals(expectedOwner, actualOwner);
        verify(web3j).ethCall(any(), any());
    }

    @Test
    void getTokenURI_WithValidTokenId_ShouldReturnTokenURI() throws Exception {
        // Given
        Long tokenId = 123L;
        String expectedURI = "https://api.example.com/metadata/123";

        EthCall mockResponse = mock(EthCall.class);
        when(mockResponse.getValue()).thenReturn(expectedURI);
        when(web3j.ethCall(any(), any()).sendAsync()).thenReturn(CompletableFuture.completedFuture(mockResponse));

        // When
        String actualURI = blockchainClient.getTokenURI(tokenId);

        // Then
        assertEquals(expectedURI, actualURI);
        verify(web3j).ethCall(any(), any());
    }

    @Test
    void getStoredHash_WithValidTokenId_ShouldReturnStoredHash() throws Exception {
        // Given
        Long tokenId = 123L;
        String expectedHash = "a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456";

        EthCall mockResponse = mock(EthCall.class);
        when(mockResponse.getValue()).thenReturn(expectedHash);
        when(web3j.ethCall(any(), any()).sendAsync()).thenReturn(CompletableFuture.completedFuture(mockResponse));

        // When
        String actualHash = blockchainClient.getStoredHash(tokenId);

        // Then
        assertEquals(expectedHash, actualHash);
        verify(web3j).ethCall(any(), any());
    }

    @Test
    void isTokenRevoked_WithValidTokenId_ShouldReturnRevocationStatus() throws Exception {
        // Given
        Long tokenId = 123L;
        boolean expectedRevoked = false;

        EthCall mockResponse = mock(EthCall.class);
        when(mockResponse.getValue()).thenReturn("0x0000000000000000000000000000000000000000000000000000000000000000");
        when(web3j.ethCall(any(), any()).sendAsync()).thenReturn(CompletableFuture.completedFuture(mockResponse));

        // When
        boolean actualRevoked = blockchainClient.isTokenRevoked(tokenId);

        // Then
        assertEquals(expectedRevoked, actualRevoked);
        verify(web3j).ethCall(any(), any());
    }

    @Test
    void isTokenRevoked_WithRevokedToken_ShouldReturnTrue() throws Exception {
        // Given
        Long tokenId = 123L;

        EthCall mockResponse = mock(EthCall.class);
        when(mockResponse.getValue()).thenReturn("0x0000000000000000000000000000000000000000000000000000000000000001");
        when(web3j.ethCall(any(), any()).sendAsync()).thenReturn(CompletableFuture.completedFuture(mockResponse));

        // When
        boolean actualRevoked = blockchainClient.isTokenRevoked(tokenId);

        // Then
        assertTrue(actualRevoked);
        verify(web3j).ethCall(any(), any());
    }

    @Test
    void verifyToken_WithValidTokenId_ShouldReturnVerificationResult() throws Exception {
        // Given
        Long tokenId = 123L;
        String storedHash = "a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456";

        EthCall mockResponse = mock(EthCall.class);
        when(mockResponse.getValue()).thenReturn(storedHash);
        when(web3j.ethCall(any(), any()).sendAsync()).thenReturn(CompletableFuture.completedFuture(mockResponse));

        // When
        String actualHash = blockchainClient.verifyToken(tokenId);

        // Then
        assertEquals(storedHash, actualHash);
        verify(web3j).ethCall(any(), any());
    }

    @Test
    void getTokenOwner_WithNullTokenId_ShouldThrowException() {
        // When & Then
        assertThrows(IllegalArgumentException.class, () -> {
            blockchainClient.getTokenOwner(null);
        });
    }

    @Test
    void getTokenURI_WithNegativeTokenId_ShouldThrowException() {
        // When & Then
        assertThrows(IllegalArgumentException.class, () -> {
            blockchainClient.getTokenURI(-1L);
        });
    }

    @Test
    void getStoredHash_WithZeroTokenId_ShouldThrowException() {
        // When & Then
        assertThrows(IllegalArgumentException.class, () -> {
            blockchainClient.getStoredHash(0L);
        });
    }

    @Test
    void blockchainCall_WithException_ShouldThrowRuntimeException() throws Exception {
        // Given
        Long tokenId = 123L;
        when(web3j.ethCall(any(), any()).sendAsync())
                .thenReturn(CompletableFuture.failedFuture(new RuntimeException("Blockchain error")));

        // When & Then
        assertThrows(RuntimeException.class, () -> {
            blockchainClient.getTokenOwner(tokenId);
        });
    }
}
