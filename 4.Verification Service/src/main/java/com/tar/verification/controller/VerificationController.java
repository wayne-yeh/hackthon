package com.tar.verification.controller;

import com.tar.verification.dto.VerificationResponse;
import com.tar.verification.service.VerificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for token verification
 */
@RestController
@RequestMapping("/api/verify")
@Tag(name = "Verification", description = "Token verification endpoints")
public class VerificationController {

    private static final Logger logger = LoggerFactory.getLogger(VerificationController.class);

    private final VerificationService verificationService;

    public VerificationController(VerificationService verificationService) {
        this.verificationService = verificationService;
    }

    /**
     * Verify a token by its ID
     * 
     * @param tokenId Token ID to verify
     * @return VerificationResponse with validation results
     */
    @GetMapping
    @Operation(summary = "Verify token by ID", description = "Verify a token by fetching its metadata and comparing the hash with the stored hash on-chain")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Verification completed successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid token ID"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<VerificationResponse> verifyToken(
            @Parameter(description = "Token ID to verify", required = true, example = "123") @RequestParam Long tokenId) {

        logger.info("Received verification request for token ID: {}", tokenId);

        try {
            VerificationResponse response = verificationService.verifyToken(tokenId);
            logger.info("Verification completed for token {}: valid={}", tokenId, response.isValid());
            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            logger.warn("Invalid token ID provided: {}", tokenId);
            return ResponseEntity.badRequest().build();

        } catch (Exception e) {
            logger.error("Error during token verification for tokenId: {}", tokenId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Verify a token by its serial number
     * 
     * @param serial Serial number to verify
     * @return VerificationResponse with validation results
     */
    @GetMapping("/by-serial")
    @Operation(summary = "Verify token by serial number", description = "Verify a token by resolving its serial number to token ID and then verifying")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Verification completed successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid serial number"),
            @ApiResponse(responseCode = "501", description = "Feature not implemented"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<VerificationResponse> verifyBySerial(
            @Parameter(description = "Serial number to verify", required = true, example = "TAR-2024-001") @RequestParam String serial) {

        logger.info("Received verification request for serial number: {}", serial);

        try {
            VerificationResponse response = verificationService.verifyBySerial(serial);
            logger.info("Verification completed for serial {}: valid={}", serial, response.isValid());
            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            logger.warn("Invalid serial number provided: {}", serial);
            return ResponseEntity.badRequest().build();

        } catch (UnsupportedOperationException e) {
            logger.warn("Serial number verification not implemented for: {}", serial);
            return ResponseEntity.status(501).build();

        } catch (Exception e) {
            logger.error("Error during serial verification for serial: {}", serial, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Health check endpoint
     * 
     * @return Health status
     */
    @GetMapping("/health")
    @Operation(summary = "Health check", description = "Check if the verification service is healthy")
    @ApiResponse(responseCode = "200", description = "Service is healthy")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Verification service is healthy");
    }
}
