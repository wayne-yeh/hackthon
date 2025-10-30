package com.tar.backend.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * DTO for issuing a new TAR receipt
 */
public class IssueReceiptRequest {

    @NotBlank(message = "Invoice number is required")
    private String invoiceNo;

    @NotNull(message = "Purchase date is required")
    @PastOrPresent(message = "Purchase date cannot be in the future")
    private LocalDate purchaseDate;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than 0")
    private BigDecimal amount;

    @NotBlank(message = "Item name is required")
    @Size(min = 1, max = 200, message = "Item name must be between 1 and 200 characters")
    private String itemName;

    @NotBlank(message = "Owner address is required")
    @Pattern(regexp = "^0x[a-fA-F0-9]{40}$", message = "Owner address must be a valid Ethereum address")
    private String ownerAddress;

    private String imageBase64;

    private String image; // Support both 'image' and 'imageBase64' for flexibility

    // Constructors
    public IssueReceiptRequest() {
    }

    public IssueReceiptRequest(String invoiceNo, LocalDate purchaseDate, BigDecimal amount,
            String itemName, String ownerAddress, String imageBase64) {
        this.invoiceNo = invoiceNo;
        this.purchaseDate = purchaseDate;
        this.amount = amount;
        this.itemName = itemName;
        this.ownerAddress = ownerAddress;
        this.imageBase64 = imageBase64;
    }

    // Getters and Setters
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

    public String getImageBase64() {
        return imageBase64;
    }

    public void setImageBase64(String imageBase64) {
        this.imageBase64 = imageBase64;
    }

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }
}
