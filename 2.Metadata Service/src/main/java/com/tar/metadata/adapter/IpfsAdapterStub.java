package com.tar.metadata.adapter;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * IPFS adapter stub implementation
 * This is a placeholder implementation that stores data in memory
 * TODO: Implement actual IPFS integration
 */
@Component
public class IpfsAdapterStub implements StorageAdapter {

    private static final Logger logger = LoggerFactory.getLogger(IpfsAdapterStub.class);

    // In-memory storage for demo purposes
    private final Map<String, String> metadataStorage = new HashMap<>();
    private final Map<String, byte[]> fileStorage = new HashMap<>();

    @Override
    public String uploadMetadata(String metadataJson, String filename) throws Exception {
        try {
            String hash = UUID.randomUUID().toString();
            metadataStorage.put(hash, metadataJson);

            String url = "ipfs://" + hash;
            logger.info("Metadata uploaded to IPFS stub: {}", url);
            return url;

        } catch (Exception e) {
            logger.error("Failed to upload metadata to IPFS stub: {}", e.getMessage(), e);
            throw new Exception("Failed to upload metadata to IPFS", e);
        }
    }

    @Override
    public String uploadFile(MultipartFile file, String filename) throws Exception {
        try {
            String hash = UUID.randomUUID().toString();
            fileStorage.put(hash, file.getBytes());

            String url = "ipfs://" + hash;
            logger.info("File uploaded to IPFS stub: {}", url);
            return url;

        } catch (IOException e) {
            logger.error("Failed to upload file to IPFS stub: {}", e.getMessage(), e);
            throw new Exception("Failed to upload file to IPFS", e);
        }
    }

    @Override
    public String downloadMetadata(String url) throws Exception {
        try {
            String hash = extractHashFromUrl(url);
            String metadata = metadataStorage.get(hash);

            if (metadata == null) {
                throw new Exception("Metadata not found for hash: " + hash);
            }

            logger.info("Metadata downloaded from IPFS stub: {}", url);
            return metadata;

        } catch (Exception e) {
            logger.error("Failed to download metadata from IPFS stub: {}", e.getMessage(), e);
            throw new Exception("Failed to download metadata from IPFS", e);
        }
    }

    private String extractHashFromUrl(String url) {
        if (url.startsWith("ipfs://")) {
            return url.substring(7);
        }
        throw new IllegalArgumentException("Invalid IPFS URL format: " + url);
    }

    /**
     * Get storage statistics for debugging
     * 
     * @return storage statistics
     */
    public Map<String, Object> getStorageStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("metadataCount", metadataStorage.size());
        stats.put("fileCount", fileStorage.size());
        stats.put("totalSize", fileStorage.values().stream().mapToInt(bytes -> bytes.length).sum());
        return stats;
    }
}


