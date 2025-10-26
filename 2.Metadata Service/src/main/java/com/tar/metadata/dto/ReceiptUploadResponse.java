package com.tar.metadata.dto;

/**
 * DTO for receipt metadata upload response
 */
public class ReceiptUploadResponse {

    private String metadataUrl;
    private String metaHash;

    // Constructors
    public ReceiptUploadResponse() {
    }

    public ReceiptUploadResponse(String metadataUrl, String metaHash) {
        this.metadataUrl = metadataUrl;
        this.metaHash = metaHash;
    }

    // Getters and Setters
    public String getMetadataUrl() {
        return metadataUrl;
    }

    public void setMetadataUrl(String metadataUrl) {
        this.metadataUrl = metadataUrl;
    }

    public String getMetaHash() {
        return metaHash;
    }

    public void setMetaHash(String metaHash) {
        this.metaHash = metaHash;
    }
}
