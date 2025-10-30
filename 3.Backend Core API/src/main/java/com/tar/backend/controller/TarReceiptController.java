package com.tar.backend.controller;

import com.tar.backend.dto.*;
import com.tar.backend.service.TarReceiptService;
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
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for TAR Receipt operations
 */
@RestController
@RequestMapping("/api/v1/receipts")
@Tag(name = "TAR Receipts", description = "API for managing Tokenized Asset Receipt NFTs")
public class TarReceiptController {

    private final TarReceiptService receiptService;

    @Autowired
    public TarReceiptController(TarReceiptService receiptService) {
        this.receiptService = receiptService;
    }

    @PostMapping("/issue")
    @Operation(summary = "Issue a new TAR receipt", description = "Creates metadata, mints NFT on blockchain, and stores receipt data")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Receipt issued successfully", content = @Content(schema = @Schema(implementation = IssueReceiptResponse.class))),
            @ApiResponse(responseCode = "400", description = "Invalid request data"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<IssueReceiptResponse> issueReceipt(
            @Valid @RequestBody IssueReceiptRequest request) {
        try {
            IssueReceiptResponse response = receiptService.issueReceipt(request);
            if (response.isSuccess()) {
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.badRequest().body(response);
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(IssueReceiptResponse.failure("Internal error: " + e.getMessage()));
        }
    }

    @PostMapping("/verify")
    @Operation(summary = "Verify a TAR receipt", description = "Verifies receipt validity against blockchain and metadata hash")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Verification completed", content = @Content(schema = @Schema(implementation = VerifyReceiptResponse.class))),
            @ApiResponse(responseCode = "400", description = "Invalid request data")
    })
    public ResponseEntity<VerifyReceiptResponse> verifyReceipt(
            @Valid @RequestBody VerifyReceiptRequest request) {
        VerifyReceiptResponse response = receiptService.verifyReceipt(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{tokenId}/revoke")
    @Operation(summary = "Revoke a TAR receipt", description = "Revokes a receipt on blockchain and marks it as invalid")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Receipt revoked successfully"),
            @ApiResponse(responseCode = "404", description = "Receipt not found"),
            @ApiResponse(responseCode = "400", description = "Receipt already revoked")
    })
    public ResponseEntity<String> revokeReceipt(
            @Parameter(description = "Token ID of the receipt to revoke") @PathVariable Long tokenId) {
        try {
            receiptService.revokeReceipt(tokenId);
            return ResponseEntity.ok("Receipt revoked successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/{tokenId}/details")
    @Operation(summary = "Get receipt details", description = "Retrieves detailed information about a specific receipt")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Receipt details retrieved", content = @Content(schema = @Schema(implementation = ReceiptDetailsResponse.class))),
            @ApiResponse(responseCode = "404", description = "Receipt not found")
    })
    public ResponseEntity<ReceiptDetailsResponse> getReceiptDetails(
            @Parameter(description = "Token ID of the receipt") @PathVariable Long tokenId) {
        try {
            ReceiptDetailsResponse response = receiptService.getReceiptDetails(tokenId);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/owner/{ownerAddress}")
    @Operation(summary = "Get receipts by owner", description = "Retrieves all receipts owned by a specific address")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Receipts retrieved successfully")
    })
    public ResponseEntity<List<ReceiptDetailsResponse>> getReceiptsByOwner(
            @Parameter(description = "Ethereum address of the owner") @PathVariable String ownerAddress) {
        List<ReceiptDetailsResponse> receipts = receiptService.getReceiptsByOwner(ownerAddress);
        return ResponseEntity.ok(receipts);
    }

    @GetMapping("/owner/{ownerAddress}/active")
    @Operation(summary = "Get active receipts by owner", description = "Retrieves all non-revoked receipts owned by a specific address")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Active receipts retrieved successfully")
    })
    public ResponseEntity<List<ReceiptDetailsResponse>> getActiveReceiptsByOwner(
            @Parameter(description = "Ethereum address of the owner") @PathVariable String ownerAddress) {
        List<ReceiptDetailsResponse> receipts = receiptService.getActiveReceiptsByOwner(ownerAddress);
        return ResponseEntity.ok(receipts);
    }
}

