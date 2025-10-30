package com.tar.metadata;

import com.tar.metadata.adapter.S3Adapter;
import com.tar.metadata.dto.ReceiptUploadRequest;
import com.tar.metadata.dto.ReceiptUploadResponse;
import com.tar.metadata.service.MetadataService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.context.TestPropertySource;
import org.testcontainers.containers.localstack.LocalStackContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.utility.DockerImageName;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Integration tests with Testcontainers and LocalStack
 */
@SpringBootTest
@Testcontainers
@TestPropertySource(properties = {
        "app.storage.type=s3"
})
class S3IntegrationTest {

    @Container
    static LocalStackContainer localStack = new LocalStackContainer(
            DockerImageName.parse("localstack/localstack:latest"))
            .withServices(LocalStackContainer.Service.S3);

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("aws.s3.endpoint", localStack::getEndpoint);
        registry.add("aws.s3.region", () -> localStack.getRegion());
        registry.add("aws.s3.access-key", () -> localStack.getAccessKey());
        registry.add("aws.s3.secret-key", () -> localStack.getSecretKey());
    }

    @Autowired
    private MetadataService metadataService;

    @Autowired
    private S3Adapter s3Adapter;

    @Test
    @DisplayName("Should upload receipt metadata to S3 successfully")
    void shouldUploadReceiptMetadataToS3Successfully() throws Exception {
        // Given
        ReceiptUploadRequest request = new ReceiptUploadRequest();
        request.setInvoiceNo("INV-S3-001");
        request.setPurchaseDate(LocalDate.of(2023, 10, 24));
        request.setAmount(new BigDecimal("1500.00"));
        request.setItemName("S3 Integration Test Item");
        request.setOwnerAddress("0x1234567890123456789012345678901234567890");
        request.setImage(null);

        // When
        ReceiptUploadResponse response = metadataService.uploadReceipt(request);

        // Then
        assertNotNull(response);
        assertNotNull(response.getMetadataUrl());
        assertNotNull(response.getMetaHash());
        assertTrue(response.getMetadataUrl().contains("metadata"));
        assertEquals(64, response.getMetaHash().length());
    }

    @Test
    @DisplayName("Should upload file to S3 successfully")
    void shouldUploadFileToS3Successfully() throws Exception {
        // Given
        String testContent = "test metadata content";
        String filename = "test-metadata.json";

        // When
        String url = s3Adapter.uploadMetadata(testContent, filename);

        // Then
        assertNotNull(url);
        assertTrue(url.contains("metadata"));
        assertTrue(url.contains(filename));
    }

    @Test
    @DisplayName("Should download metadata from S3 successfully")
    void shouldDownloadMetadataFromS3Successfully() throws Exception {
        // Given
        String testContent = "test metadata content for download";
        String filename = "test-download.json";
        String uploadUrl = s3Adapter.uploadMetadata(testContent, filename);

        // When
        String downloadedContent = s3Adapter.downloadMetadata(uploadUrl);

        // Then
        assertNotNull(downloadedContent);
        assertEquals(testContent, downloadedContent);
    }

    @Test
    @DisplayName("Should verify same hash for same metadata")
    void shouldVerifySameHashForSameMetadata() throws Exception {
        // Given
        ReceiptUploadRequest request = new ReceiptUploadRequest();
        request.setInvoiceNo("INV-S3-HASH-001");
        request.setPurchaseDate(LocalDate.of(2023, 10, 24));
        request.setAmount(new BigDecimal("2500.00"));
        request.setItemName("S3 Hash Verification Test Item");
        request.setOwnerAddress("0x1234567890123456789012345678901234567890");
        request.setImage(null);

        ReceiptUploadResponse response = metadataService.uploadReceipt(request);

        // When
        String retrievedHash = metadataService.getMetadataHash(response.getMetadataUrl());

        // Then
        assertNotNull(retrievedHash);
        assertEquals(response.getMetaHash(), retrievedHash);
    }
}
