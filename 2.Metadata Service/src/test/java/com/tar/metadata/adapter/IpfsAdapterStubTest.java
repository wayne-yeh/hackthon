package com.tar.metadata.adapter;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.springframework.mock.web.MockMultipartFile;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for IpfsAdapterStub
 */
class IpfsAdapterStubTest {

    private IpfsAdapterStub ipfsAdapterStub;

    @BeforeEach
    void setUp() {
        ipfsAdapterStub = new IpfsAdapterStub();
    }

    @Test
    @DisplayName("Should upload metadata successfully")
    void shouldUploadMetadataSuccessfully() throws Exception {
        // Given
        String metadataJson = "{\"test\": \"data\"}";
        String filename = "test-metadata.json";

        // When
        String url = ipfsAdapterStub.uploadMetadata(metadataJson, filename);

        // Then
        assertNotNull(url);
        assertTrue(url.startsWith("ipfs://"));
        assertEquals(36, url.substring(7).length()); // UUID length
    }

    @Test
    @DisplayName("Should upload file successfully")
    void shouldUploadFileSuccessfully() throws Exception {
        // Given
        MockMultipartFile file = new MockMultipartFile(
                "file", "test.jpg", "image/jpeg", "test image content".getBytes());
        String filename = "test-image.jpg";

        // When
        String url = ipfsAdapterStub.uploadFile(file, filename);

        // Then
        assertNotNull(url);
        assertTrue(url.startsWith("ipfs://"));
        assertEquals(36, url.substring(7).length());
    }

    @Test
    @DisplayName("Should download metadata successfully")
    void shouldDownloadMetadataSuccessfully() throws Exception {
        // Given
        String metadataJson = "{\"test\": \"data\"}";
        String filename = "test-metadata.json";
        String uploadUrl = ipfsAdapterStub.uploadMetadata(metadataJson, filename);

        // When
        String downloadedJson = ipfsAdapterStub.downloadMetadata(uploadUrl);

        // Then
        assertNotNull(downloadedJson);
        assertEquals(metadataJson, downloadedJson);
    }

    @Test
    @DisplayName("Should throw exception for invalid IPFS URL")
    void shouldThrowExceptionForInvalidIpfsUrl() {
        // Given
        String invalidUrl = "http://invalid-url.com";

        // When & Then
        assertThrows(Exception.class, () -> {
            ipfsAdapterStub.downloadMetadata(invalidUrl);
        });
    }

    @Test
    @DisplayName("Should throw exception for non-existent metadata")
    void shouldThrowExceptionForNonExistentMetadata() {
        // Given
        String nonExistentUrl = "ipfs://non-existent-hash";

        // When & Then
        assertThrows(Exception.class, () -> {
            ipfsAdapterStub.downloadMetadata(nonExistentUrl);
        });
    }

    @Test
    @DisplayName("Should return storage statistics")
    void shouldReturnStorageStatistics() throws Exception {
        // Given
        ipfsAdapterStub.uploadMetadata("{\"test1\": \"data1\"}", "test1.json");
        ipfsAdapterStub.uploadMetadata("{\"test2\": \"data2\"}", "test2.json");

        MockMultipartFile file1 = new MockMultipartFile(
                "file1", "test1.jpg", "image/jpeg", "content1".getBytes());
        MockMultipartFile file2 = new MockMultipartFile(
                "file2", "test2.jpg", "image/jpeg", "content2".getBytes());

        ipfsAdapterStub.uploadFile(file1, "test1.jpg");
        ipfsAdapterStub.uploadFile(file2, "test2.jpg");

        // When
        var stats = ipfsAdapterStub.getStorageStats();

        // Then
        assertNotNull(stats);
        assertEquals(2, stats.get("metadataCount"));
        assertEquals(2, stats.get("fileCount"));
        assertEquals(16, stats.get("totalSize")); // "content1" + "content2" = 16 bytes
    }
}
