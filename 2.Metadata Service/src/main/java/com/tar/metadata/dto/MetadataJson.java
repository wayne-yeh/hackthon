package com.tar.metadata.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * DTO for metadata JSON structure
 * Includes ERC721 standard fields for NFT compatibility
 */
public class MetadataJson {

    // ERC721 Standard Fields
    @JsonProperty("name")
    private String name;

    @JsonProperty("description")
    private String description;

    @JsonProperty("image")
    private String image;

    // Custom Fields
    @JsonProperty("invoiceNo")
    private String invoiceNo;

    @JsonProperty("purchaseDate")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate purchaseDate;

    @JsonProperty("amount")
    private BigDecimal amount;

    @JsonProperty("itemName")
    private String itemName;

    @JsonProperty("ownerAddress")
    private String ownerAddress;

    @JsonProperty("imageUrl")
    private String imageUrl;

    @JsonProperty("timestamp")
    private long timestamp;

    // Constructors
    public MetadataJson() {
    }

    public MetadataJson(String invoiceNo, LocalDate purchaseDate, BigDecimal amount,
            String itemName, String ownerAddress, String imageUrl, long timestamp) {
        this.invoiceNo = invoiceNo;
        this.purchaseDate = purchaseDate;
        this.amount = amount;
        this.itemName = itemName;
        this.ownerAddress = ownerAddress;
        this.imageUrl = imageUrl;
        this.image = imageUrl; // Set ERC721 image field
        this.timestamp = timestamp;
    }

    // Getters and Setters
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
        // Also set imageUrl for backward compatibility
        this.imageUrl = image;
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

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
        // Also set ERC721 image field
        this.image = imageUrl;
    }

    public long getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(long timestamp) {
        this.timestamp = timestamp;
    }
}
