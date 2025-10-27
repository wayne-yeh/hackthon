package com.tar.backend.dto;

/**
 * DTO for issue receipt response
 */
public class IssueReceiptResponse {

    private Long tokenId;
    private String transactionHash;
    private String metadataUri;
    private String metadataHash;
    private String ownerAddress;
    private boolean success;
    private String message;

    // Constructors
    public IssueReceiptResponse() {
    }

    public IssueReceiptResponse(Long tokenId, String transactionHash, String metadataUri,
            String metadataHash, String ownerAddress, boolean success, String message) {
        this.tokenId = tokenId;
        this.transactionHash = transactionHash;
        this.metadataUri = metadataUri;
        this.metadataHash = metadataHash;
        this.ownerAddress = ownerAddress;
        this.success = success;
        this.message = message;
    }

    public static IssueReceiptResponse success(Long tokenId, String transactionHash,
            String metadataUri, String metadataHash, String ownerAddress) {
        return new IssueReceiptResponse(tokenId, transactionHash, metadataUri, metadataHash,
                ownerAddress, true, "Receipt issued successfully");
    }

    public static IssueReceiptResponse failure(String message) {
        IssueReceiptResponse response = new IssueReceiptResponse();
        response.setSuccess(false);
        response.setMessage(message);
        return response;
    }

    // Getters and Setters
    public Long getTokenId() {
        return tokenId;
    }

    public void setTokenId(Long tokenId) {
        this.tokenId = tokenId;
    }

    public String getTransactionHash() {
        return transactionHash;
    }

    public void setTransactionHash(String transactionHash) {
        this.transactionHash = transactionHash;
    }

    public String getMetadataUri() {
        return metadataUri;
    }

    public void setMetadataUri(String metadataUri) {
        this.metadataUri = metadataUri;
    }

    public String getMetadataHash() {
        return metadataHash;
    }

    public void setMetadataHash(String metadataHash) {
        this.metadataHash = metadataHash;
    }

    public String getOwnerAddress() {
        return ownerAddress;
    }

    public void setOwnerAddress(String ownerAddress) {
        this.ownerAddress = ownerAddress;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}

