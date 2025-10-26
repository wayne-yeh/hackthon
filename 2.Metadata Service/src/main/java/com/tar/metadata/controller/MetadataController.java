package com.tar.metadata.controller;

import com.tar.metadata.dto.HashVerificationResponse;
import com.tar.metadata.dto.ReceiptUploadRequest;
import com.tar.metadata.dto.ReceiptUploadResponse;
import com.tar.metadata.service.MetadataService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST Controller for metadata operations
 */
@RestController
@RequestMapping("/api/metadata")
@Tag(name = "Metadata", description = "Metadata management operations")
public class MetadataController {

    private final MetadataService metadataService;

    @Autowired
    public MetadataController(MetadataService metadataService) {
        this.metadataService = metadataService;
    }

    @Operation(summary = "Upload receipt metadata", description = "Upload receipt metadata with optional image file and return metadata URL and hash")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Metadata uploaded successfully", content = @Content(schema = @Schema(implementation = ReceiptUploadResponse.class))),
            @ApiResponse(responseCode = "400", description = "Invalid input data"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    @PostMapping(value = "/receipts", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ReceiptUploadResponse> uploadReceipt(
            @Parameter(description = "Invoice number") @RequestParam String invoiceNo,
            @Parameter(description = "Purchase date (yyyy-MM-dd)") @RequestParam String purchaseDate,
            @Parameter(description = "Amount") @RequestParam String amount,
            @Parameter(description = "Item name") @RequestParam String itemName,
            @Parameter(description = "Owner Ethereum address") @RequestParam String ownerAddress,
            @Parameter(description = "Optional image file") @RequestParam(required = false) org.springframework.web.multipart.MultipartFile image) {

        try {
            ReceiptUploadRequest request = new ReceiptUploadRequest();
            request.setInvoiceNo(invoiceNo);
            request.setPurchaseDate(java.time.LocalDate.parse(purchaseDate));
            request.setAmount(new java.math.BigDecimal(amount));
            request.setItemName(itemName);
            request.setOwnerAddress(ownerAddress);
            request.setImage(image);

            ReceiptUploadResponse response = metadataService.uploadReceipt(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @Operation(summary = "Get metadata hash", description = "Retrieve the SHA-256 hash of metadata from a given URL")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Hash retrieved successfully", content = @Content(schema = @Schema(implementation = HashVerificationResponse.class))),
            @ApiResponse(responseCode = "400", description = "Invalid URL"),
            @ApiResponse(responseCode = "404", description = "Metadata not found"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    @GetMapping("/hash")
    public ResponseEntity<HashVerificationResponse> getMetadataHash(
            @Parameter(description = "Metadata URL") @RequestParam String url) {

        try {
            String hash = metadataService.getMetadataHash(url);
            HashVerificationResponse response = new HashVerificationResponse(hash);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @Operation(summary = "Download file", description = "Download file from storage by key")
    @GetMapping("/download")
    public ResponseEntity<String> downloadFile(
            @Parameter(description = "File key") @RequestParam String key) {

        try {
            String url = "http://localhost:8081/api/metadata/download?key=" + key;
            String content = metadataService.downloadMetadata(url);
            return ResponseEntity.ok(content);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
