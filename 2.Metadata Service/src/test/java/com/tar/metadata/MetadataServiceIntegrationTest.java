package com.tar.metadata;

import com.tar.metadata.adapter.IpfsAdapterStub;
import com.tar.metadata.dto.ReceiptUploadRequest;
import com.tar.metadata.dto.ReceiptUploadResponse;
import com.tar.metadata.service.MetadataService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Integration tests for MetadataService
 */
@SpringBootTest
@TestPropertySource(properties = {
        "app.storage.type=ipfs"
})
class MetadataServiceIntegrationTest {

    @Autowired
    private MetadataService metadataService;

    @Autowired
    private IpfsAdapterStub ipfsAdapterStub;

    @Test
    @DisplayName("Should upload receipt metadata successfully")
    void shouldUploadReceiptMetadataSuccessfully() throws Exception {
        // Given
        ReceiptUploadRequest request = new ReceiptUploadRequest();
        request.setInvoiceNo("INV-INT-001");
        request.setPurchaseDate(LocalDate.of(2023, 10, 24));
        request.setAmount(new BigDecimal("1000.00"));
        request.setItemName("Integration Test Item");
        request.setOwnerAddress("0x1234567890123456789012345678901234567890");
        request.setImage(null);

        // When
        ReceiptUploadResponse response = metadataService.uploadReceipt(request);

        // Then
        assertNotNull(response);
        assertNotNull(response.getMetadataUrl());
        assertNotNull(response.getMetaHash());
        assertTrue(response.getMetadataUrl().startsWith("ipfs://"));
        assertEquals(64, response.getMetaHash().length()); // SHA-256 hex length
    }

    @Test
    @DisplayName("Should upload receipt with image successfully")
    void shouldUploadReceiptWithImageSuccessfully() throws Exception {
        // Given
        ReceiptUploadRequest request = new ReceiptUploadRequest();
        request.setInvoiceNo("INV-INT-002");
        request.setPurchaseDate(LocalDate.of(2023, 10, 24));
        request.setAmount(new BigDecimal("2000.00"));
        request.setItemName("Integration Test Item with Image");
        request.setOwnerAddress("0x1234567890123456789012345678901234567890");

        // Create mock image
        MultipartFile mockImage = new org.springframework.mock.web.MockMultipartFile(
                "image", "test.jpg", "image/jpeg", "test image content".getBytes());
        request.setImage(mockImage);

        // When
        ReceiptUploadResponse response = metadataService.uploadReceipt(request);

        // Then
        assertNotNull(response);
        assertNotNull(response.getMetadataUrl());
        assertNotNull(response.getMetaHash());
        assertTrue(response.getMetadataUrl().startsWith("ipfs://"));
        assertEquals(64, response.getMetaHash().length());
    }

    @Test
    @DisplayName("Should verify metadata hash correctly")
    void shouldVerifyMetadataHashCorrectly() throws Exception {
        // Given
        ReceiptUploadRequest request = new ReceiptUploadRequest();
        request.setInvoiceNo("INV-INT-003");
        request.setPurchaseDate(LocalDate.of(2023, 10, 24));
        request.setAmount(new BigDecimal("3000.00"));
        request.setItemName("Hash Verification Test Item");
        request.setOwnerAddress("0x1234567890123456789012345678901234567890");
        request.setImage(null);

        ReceiptUploadResponse uploadResponse = metadataService.uploadReceipt(request);

        // When
        String retrievedHash = metadataService.getMetadataHash(uploadResponse.getMetadataUrl());

        // Then
        assertNotNull(retrievedHash);
        assertEquals(uploadResponse.getMetaHash(), retrievedHash);
    }

    @Test
    @DisplayName("Should handle invalid URL gracefully")
    void shouldHandleInvalidUrlGracefully() {
        // Given
        String invalidUrl = "invalid-url";

        // When & Then
        assertThrows(Exception.class, () -> {
            metadataService.getMetadataHash(invalidUrl);
        });
    }

    @Test
    @DisplayName("Should handle empty URL gracefully")
    void shouldHandleEmptyUrlGracefully() {
        // Given
        String emptyUrl = "";

        // When & Then
        assertThrows(IllegalArgumentException.class, () -> {
            metadataService.getMetadataHash(emptyUrl);
        });
    }
}
