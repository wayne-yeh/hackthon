package com.tar.backend.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Entity representing a TAR receipt record
 */
@Entity
@Table(name = "tar_receipts", indexes = {
        @Index(name = "idx_token_id", columnList = "tokenId"),
        @Index(name = "idx_owner_address", columnList = "ownerAddress"),
        @Index(name = "idx_invoice_no", columnList = "invoiceNo")
})
public class TarReceipt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private Long tokenId;

    @Column(nullable = false, unique = true)
    private String invoiceNo;

    @Column(nullable = false)
    private LocalDate purchaseDate;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false)
    private String itemName;

    @Column(nullable = false, length = 42)
    private String ownerAddress;

    @Column(nullable = false)
    private String metadataUri;

    @Column(nullable = false, length = 66)
    private String metadataHash;

    @Column(nullable = false, length = 66)
    private String transactionHash;

    @Column(nullable = false)
    private Boolean revoked = false;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    private LocalDateTime revokedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    // Constructors
    public TarReceipt() {
    }

    public TarReceipt(Long tokenId, String invoiceNo, LocalDate purchaseDate, BigDecimal amount,
            String itemName, String ownerAddress, String metadataUri, String metadataHash,
            String transactionHash) {
        this.tokenId = tokenId;
        this.invoiceNo = invoiceNo;
        this.purchaseDate = purchaseDate;
        this.amount = amount;
        this.itemName = itemName;
        this.ownerAddress = ownerAddress;
        this.metadataUri = metadataUri;
        this.metadataHash = metadataHash;
        this.transactionHash = transactionHash;
        this.revoked = false;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

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

    public Boolean getRevoked() {
        return revoked;
    }

    public void setRevoked(Boolean revoked) {
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

