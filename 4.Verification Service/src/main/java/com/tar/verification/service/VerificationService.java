package com.tar.verification.service;

import com.tar.verification.client.BlockchainClient;
import com.tar.verification.client.MetadataClient;
import com.tar.verification.dto.TokenMetadata;
import com.tar.verification.dto.VerificationResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * Main service for token verification
 */
@Service
public class VerificationService {

    private static final Logger logger = LoggerFactory.getLogger(VerificationService.class);

    private final BlockchainClient blockchainClient;
    private final MetadataClient metadataClient;
    private final HashComparatorService hashComparatorService;

    public VerificationService(BlockchainClient blockchainClient,
            MetadataClient metadataClient,
            HashComparatorService hashComparatorService) {
        this.blockchainClient = blockchainClient;
        this.metadataClient = metadataClient;
        this.hashComparatorService = hashComparatorService;
    }

    /**
     * Verify a token by checking its metadata hash against the stored hash
     * 
     * @param tokenId Token ID to verify
     * @return VerificationResponse with validation results
     * @throws IllegalArgumentException if tokenId is null or invalid
     * @throws RuntimeException         if verification fails due to system errors
     */
    public VerificationResponse verifyToken(Long tokenId) {
        validateTokenId(tokenId);

        logger.info("Starting verification for token ID: {}", tokenId);

        try {
            // Get token information from blockchain
            String owner = blockchainClient.getTokenOwner(tokenId);
            String tokenURI = blockchainClient.getTokenURI(tokenId);
            String storedHash = blockchainClient.getStoredHash(tokenId);
            boolean revoked = blockchainClient.isTokenRevoked(tokenId);

            logger.debug("Token {} - Owner: {}, URI: {}, Revoked: {}",
                    tokenId, owner, tokenURI, revoked);

            List<String> reasons = new ArrayList<>();
            boolean isValid = true;

            // Check if token is revoked
            if (revoked) {
                isValid = false;
                reasons.add("Token is revoked");
                logger.warn("Token {} is revoked", tokenId);
            }

            // Verify metadata hash
            boolean hashValid = verifyMetadataHash(tokenURI, storedHash, reasons);
            if (!hashValid) {
                isValid = false;
            }

            VerificationResponse response = VerificationResponse.builder()
                    .valid(isValid)
                    .reasons(reasons)
                    .owner(owner)
                    .tokenURI(tokenURI)
                    .revoked(revoked)
                    .tokenId(tokenId)
                    .build();

            logger.info("Verification completed for token {}: valid={}, reasons={}",
                    tokenId, isValid, reasons);

            return response;

        } catch (Exception e) {
            logger.error("Error during token verification for tokenId: {}", tokenId, e);
            throw new RuntimeException("Token verification failed", e);
        }
    }

    /**
     * Verify token by serial number (if supported by the system)
     * 
     * @param serialNumber Serial number to resolve and verify
     * @return VerificationResponse with validation results
     * @throws IllegalArgumentException if serialNumber is null or empty
     * @throws RuntimeException         if verification fails
     */
    public VerificationResponse verifyBySerial(String serialNumber) {
        if (serialNumber == null || serialNumber.trim().isEmpty()) {
            throw new IllegalArgumentException("Serial number cannot be null or empty");
        }

        logger.info("Starting verification by serial number: {}", serialNumber);

        // Note: This would require additional implementation to resolve serial number
        // to token ID
        // For now, we'll throw an exception indicating this feature is not implemented
        throw new UnsupportedOperationException("Serial number verification not yet implemented");
    }

    /**
     * Verify metadata hash by fetching metadata and comparing with stored hash
     * 
     * @param tokenURI   Token metadata URI
     * @param storedHash Hash stored on-chain
     * @param reasons    List to add failure reasons
     * @return true if hash is valid, false otherwise
     */
    private boolean verifyMetadataHash(String tokenURI, String storedHash, List<String> reasons) {
        try {
            logger.debug("Fetching metadata from URI: {}", tokenURI);
            TokenMetadata metadata = metadataClient.fetchMetadata(tokenURI);

            logger.debug("Verifying metadata hash against stored hash");
            boolean hashValid = hashComparatorService.verifyMetadataHash(metadata, storedHash);

            if (!hashValid) {
                reasons.add("Metadata hash mismatch");
                logger.warn("Metadata hash mismatch for URI: {}", tokenURI);
            }

            return hashValid;

        } catch (Exception e) {
            String errorMessage = "Failed to fetch metadata: " + e.getMessage();
            reasons.add(errorMessage);
            logger.error("Error verifying metadata hash for URI: {}", tokenURI, e);
            return false;
        }
    }

    /**
     * Validate token ID
     * 
     * @param tokenId Token ID to validate
     * @throws IllegalArgumentException if tokenId is null or invalid
     */
    private void validateTokenId(Long tokenId) {
        if (tokenId == null || tokenId <= 0) {
            throw new IllegalArgumentException("Token ID must be a positive number");
        }
    }
}
