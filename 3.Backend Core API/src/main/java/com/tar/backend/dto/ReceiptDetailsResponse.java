package com.tar.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * DTO for receipt details response
 */
public class ReceiptDetailsResponse {

    private Long tokenId;
    private String invoiceNo;
    private LocalDate purchaseDate;
    private BigDecimal amount;
    private String itemName;
    private String ownerAddress;
    private String metadataUri;
    private String metadataHash;
    private String transactionHash;
    private boolean revoked;
    private LocalDateTime createdAt;
    private LocalDateTime revokedAt;

    // Constructors
    public ReceiptDetailsResponse() {
    }

    public ReceiptDetailsResponse(Long tokenId, String invoiceNo, LocalDate purchaseDate,
            BigDecimal amount, String itemName, String ownerAddress,
            String metadataUri, String metadataHash, String transactionHash,
            boolean revoked, LocalDateTime createdAt, LocalDateTime revokedAt) {
        this.tokenId = tokenId;
        this.invoiceNo = invoiceNo;
        this.purchaseDate = purchaseDate;
        this.amount = amount;
        this.itemName = itemName;
        this.ownerAddress = ownerAddress;
        this.metadataUri = metadataUri;
        this.metadataHash = metadataHash;
        this.transactionHash = transactionHash;
        this.revoked = revoked;
        this.createdAt = createdAt;
        this.revokedAt = revokedAt;
    }

    // Getters and Setters
    public Long getTokenId() {
        return tokenId;
    }

    public void setTokenId(Long tokenId) {
        this.tokenId = tokenId;
    }

    public String getInvoiceNo() {
        return invoiceNo;
    }

    public void setInvoiceNo(String invoiceNo) {
        this.invoiceNo = invoiceNo;
    }

    public LocalDate getPurchaseDate() {
        return purchaseDate;
    }

    public void setPurchaseDate(LocalDate purchaseDate) {
        this.purchaseDate = purchaseDate;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getItemName() {
        return itemName;
    }

    public void setItemName(String itemName) {
        this.itemName = itemName;
    }

    public String getOwnerAddress() {
        return ownerAddress;
    }

    public void setOwnerAddress(String ownerAddress) {
        this.ownerAddress = ownerAddress;
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

    public String getTransactionHash() {
        return transactionHash;
    }

    public void setTransactionHash(String transactionHash) {
        this.transactionHash = transactionHash;
    }

    public boolean isRevoked() {
        return revoked;
    }

    public void setRevoked(boolean revoked) {
        this.revoked = revoked;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getRevokedAt() {
        return revokedAt;
    }

    public void setRevokedAt(LocalDateTime revokedAt) {
        this.revokedAt = revokedAt;
    }
}

