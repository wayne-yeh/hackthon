package com.tar.metadata.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Pattern;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * DTO for receipt metadata upload request
 */
public class ReceiptUploadRequest {

    @NotBlank(message = "Invoice number is required")
    private String invoiceNo;

    @NotNull(message = "Purchase date is required")
    private LocalDate purchaseDate;

    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be positive")
    private BigDecimal amount;

    @NotBlank(message = "Item name is required")
    private String itemName;

    @NotBlank(message = "Owner address is required")
    @Pattern(regexp = "^0x[a-fA-F0-9]{40}$", message = "Owner address must be a valid Ethereum address")
    private String ownerAddress;

    private MultipartFile image;

    // Constructors
    public ReceiptUploadRequest() {
    }

    public ReceiptUploadRequest(String invoiceNo, LocalDate purchaseDate, BigDecimal amount,
            String itemName, String ownerAddress, MultipartFile image) {
        this.invoiceNo = invoiceNo;
        this.purchaseDate = purchaseDate;
        this.amount = amount;
        this.itemName = itemName;
        this.ownerAddress = ownerAddress;
        this.image = image;
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

    public MultipartFile getImage() {
        return image;
    }

    public void setImage(MultipartFile image) {
        this.image = image;
    }
}


