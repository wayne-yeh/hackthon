package com.tar.backend.dto;

import java.time.LocalDateTime;

/**
 * DTO for verify receipt response
 */
public class VerifyReceiptResponse {

    private boolean valid;
    private Long tokenId;
    private String ownerAddress;
    private boolean revoked;
    private String metadataHash;
    private boolean hashMatches;
    private String message;
    private LocalDateTime verifiedAt;

    // Constructors
    public VerifyReceiptResponse() {
        this.verifiedAt = LocalDateTime.now();
    }

    public VerifyReceiptResponse(boolean valid, Long tokenId, String ownerAddress, boolean revoked,
            String metadataHash, boolean hashMatches, String message) {
        this.valid = valid;
        this.tokenId = tokenId;
        this.ownerAddress = ownerAddress;
        this.revoked = revoked;
        this.metadataHash = metadataHash;
        this.hashMatches = hashMatches;
        this.message = message;
        this.verifiedAt = LocalDateTime.now();
    }

    public static VerifyReceiptResponse valid(Long tokenId, String ownerAddress, String metadataHash) {
        return new VerifyReceiptResponse(true, tokenId, ownerAddress, false, metadataHash, true,
                "Receipt is valid");
    }

    public static VerifyReceiptResponse invalid(String message) {
        VerifyReceiptResponse response = new VerifyReceiptResponse();
        response.setValid(false);
        response.setMessage(message);
        return response;
    }

    public static VerifyReceiptResponse revoked(Long tokenId, String ownerAddress) {
        VerifyReceiptResponse response = new VerifyReceiptResponse();
        response.setValid(false);
        response.setTokenId(tokenId);
        response.setOwnerAddress(ownerAddress);
        response.setRevoked(true);
        response.setMessage("Receipt has been revoked");
        return response;
    }

    // Getters and Setters
    public boolean isValid() {
        return valid;
    }

    public void setValid(boolean valid) {
        this.valid = valid;
    }

    public Long getTokenId() {
        return tokenId;
    }

    public void setTokenId(Long tokenId) {
        this.tokenId = tokenId;
    }

    public String getOwnerAddress() {
        return ownerAddress;
    }

    public void setOwnerAddress(String ownerAddress) {
        this.ownerAddress = ownerAddress;
    }

    public boolean isRevoked() {
        return revoked;
    }

    public void setRevoked(boolean revoked) {
        this.revoked = revoked;
    }

    public String getMetadataHash() {
        return metadataHash;
    }

    public void setMetadataHash(String metadataHash) {
        this.metadataHash = metadataHash;
    }

    public boolean isHashMatches() {
        return hashMatches;
    }

    public void setHashMatches(boolean hashMatches) {
        this.hashMatches = hashMatches;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public LocalDateTime getVerifiedAt() {
        return verifiedAt;
    }

    public void setVerifiedAt(LocalDateTime verifiedAt) {
        this.verifiedAt = verifiedAt;
    }
}

