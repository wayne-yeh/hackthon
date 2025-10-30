package com.tar.metadata.dto;

/**
 * DTO for metadata hash verification response
 */
public class HashVerificationResponse {

    private String metaHash;

    // Constructors
    public HashVerificationResponse() {
    }

    public HashVerificationResponse(String metaHash) {
        this.metaHash = metaHash;
    }

    // Getters and Setters
    public String getMetaHash() {
        return metaHash;
    }

    public void setMetaHash(String metaHash) {
        this.metaHash = metaHash;
    }
}


