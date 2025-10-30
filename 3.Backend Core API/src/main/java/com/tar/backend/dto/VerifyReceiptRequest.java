package com.tar.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * DTO for verifying a TAR receipt
 */
public class VerifyReceiptRequest {

    @NotNull(message = "Token ID is required")
    private Long tokenId;

    @NotBlank(message = "Metadata hash is required")
    private String metadataHash;

    // Constructors
    public VerifyReceiptRequest() {
    }

    public VerifyReceiptRequest(Long tokenId, String metadataHash) {
        this.tokenId = tokenId;
        this.metadataHash = metadataHash;
    }

    // Getters and Setters
    public Long getTokenId() {
        return tokenId;
    }

    public void setTokenId(Long tokenId) {
        this.tokenId = tokenId;
    }

    public String getMetadataHash() {
        return metadataHash;
    }

    public void setMetadataHash(String metadataHash) {
        this.metadataHash = metadataHash;
    }
}

