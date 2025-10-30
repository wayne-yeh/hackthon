package com.tar.backend.service;

import com.tar.backend.dto.*;
import com.tar.backend.entity.TarReceipt;
import com.tar.backend.repository.TarReceiptRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Service for TAR receipt business logic
 */
@Service
@Transactional
public class TarReceiptService {

    private final TarReceiptRepository receiptRepository;
    private final BlockchainService blockchainService;
    private final MetadataServiceClient metadataServiceClient;

    @Autowired
    public TarReceiptService(TarReceiptRepository receiptRepository,
            BlockchainService blockchainService,
            MetadataServiceClient metadataServiceClient) {
        this.receiptRepository = receiptRepository;
        this.blockchainService = blockchainService;
        this.metadataServiceClient = metadataServiceClient;
    }

    /**
     * Issue a new TAR receipt
     */
    public IssueReceiptResponse issueReceipt(IssueReceiptRequest request) {
        try {
            // Check if invoice already exists
            if (receiptRepository.existsByInvoiceNo(request.getInvoiceNo())) {
                return IssueReceiptResponse.failure("Invoice number already exists");
            }

            // Step 1: Upload metadata to metadata service
            // Support both 'image' and 'imageBase64' fields - prefer 'image' if provided
            String imageData = request.getImage() != null && !request.getImage().isEmpty()
                    ? request.getImage()
                    : request.getImageBase64();

            MetadataServiceClient.MetadataUploadResult metadataResult = metadataServiceClient.uploadMetadata(
                    request.getInvoiceNo(),
                    request.getPurchaseDate(),
                    request.getAmount(),
                    request.getItemName(),
                    request.getOwnerAddress(),
                    imageData);

            // Step 2: Mint NFT on blockchain
            BlockchainService.MintResult mintResult = blockchainService.mintReceipt(
                    request.getOwnerAddress(),
                    metadataResult.getMetadataUri(),
                    metadataResult.getMetadataHash());

            if (!mintResult.isSuccess()) {
                return IssueReceiptResponse.failure("Failed to mint NFT on blockchain");
            }

            // Step 3: Save receipt to database
            TarReceipt receipt = new TarReceipt(
                    mintResult.getTokenId(),
                    request.getInvoiceNo(),
                    request.getPurchaseDate(),
                    request.getAmount(),
                    request.getItemName(),
                    request.getOwnerAddress(),
                    metadataResult.getMetadataUri(),
                    metadataResult.getMetadataHash(),
                    mintResult.getTransactionHash());

            receiptRepository.save(receipt);

            return IssueReceiptResponse.success(
                    mintResult.getTokenId(),
                    mintResult.getTransactionHash(),
                    metadataResult.getMetadataUri(),
                    metadataResult.getMetadataHash(),
                    request.getOwnerAddress());

        } catch (Exception e) {
            return IssueReceiptResponse.failure("Failed to issue receipt: " + e.getMessage());
        }
    }

    /**
     * Verify a TAR receipt
     */
    public VerifyReceiptResponse verifyReceipt(VerifyReceiptRequest request) {
        try {
            System.out.println("🔍 Starting verification for tokenId: " + request.getTokenId());
            System.out.println("   Provided metadataHash: " + request.getMetadataHash());

            // Check in database (optional - for enhanced validation)
            Optional<TarReceipt> receiptOpt = receiptRepository.findByTokenId(request.getTokenId());
            TarReceipt receipt = receiptOpt.orElse(null);

            if (receipt != null) {
                System.out.println("✅ Receipt found in database:");
                System.out.println("   Stored metadataHash: " + receipt.getMetadataHash());
                System.out.println("   Revoked: " + receipt.getRevoked());

                // Check if revoked in database
                if (receipt.getRevoked()) {
                    System.out.println("❌ Receipt is revoked in database");
                    return VerifyReceiptResponse.revoked(receipt.getTokenId(), receipt.getOwnerAddress());
                }
            } else {
                System.out.println("⚠️ Receipt not found in database, will verify on-chain only");
            }

            // Check if token is revoked on blockchain FIRST (before verification)
            System.out.println("🔍 Checking if token is revoked on blockchain...");
            try {
                boolean revokedOnChain = blockchainService.isRevoked(request.getTokenId());
                System.out.println("   isRevoked returned: " + revokedOnChain);
                if (revokedOnChain) {
                    System.out.println("❌ Token is revoked on blockchain");
                    // Get owner from blockchain if needed
                    String ownerAddress;
                    try {
                        ownerAddress = receipt != null ? receipt.getOwnerAddress()
                                : blockchainService.getTokenOwner(request.getTokenId());
                    } catch (Exception e) {
                        // If ownerOf fails, try to get from the provided receipt data
                        ownerAddress = receipt != null ? receipt.getOwnerAddress()
                                : "0x0000000000000000000000000000000000000000";
                    }
                    return VerifyReceiptResponse.revoked(request.getTokenId(), ownerAddress);
                }
            } catch (Exception e) {
                System.err.println("   ⚠️ Could not check revocation status: " + e.getMessage());
                // If isRevoked throws TokenRevoked error, token is definitely revoked
                if (e.getMessage() != null && e.getMessage().contains("TokenRevoked")) {
                    System.out.println("❌ Token is revoked (detected from isRevoked error)");
                    String ownerAddress = receipt != null ? receipt.getOwnerAddress()
                            : "0x0000000000000000000000000000000000000000";
                    return VerifyReceiptResponse.revoked(request.getTokenId(), ownerAddress);
                }
            }

            // Verify on blockchain (primary verification)
            System.out.println("🔗 Verifying on blockchain...");
            try {
                boolean isValidOnChain = blockchainService.verifyReceipt(
                        request.getTokenId(),
                        request.getMetadataHash());

                System.out.println("   Blockchain verification result: " + isValidOnChain);

                if (!isValidOnChain) {
                    System.out.println("❌ Blockchain verification failed");
                    return VerifyReceiptResponse.invalid("Blockchain verification failed");
                }
            } catch (RuntimeException e) {
                // Check if this is a revocation exception
                if ("TOKEN_REVOKED".equals(e.getMessage())) {
                    System.out.println("❌ Token is revoked on blockchain");
                    // Get owner from blockchain if needed
                    String ownerAddress;
                    try {
                        ownerAddress = receipt != null ? receipt.getOwnerAddress()
                                : blockchainService.getTokenOwner(request.getTokenId());
                    } catch (Exception ownerEx) {
                        System.err.println("   ⚠️ Could not get owner: " + ownerEx.getMessage());
                        ownerAddress = receipt != null ? receipt.getOwnerAddress()
                                : "0x0000000000000000000000000000000000000000";
                    }
                    return VerifyReceiptResponse.revoked(request.getTokenId(), ownerAddress);
                }
                // Check if token not found
                if ("TOKEN_NOT_FOUND".equals(e.getMessage())) {
                    System.out.println("❌ Token does not exist on blockchain");
                    return VerifyReceiptResponse.invalid("Token does not exist on blockchain");
                }
                throw e; // Re-throw if not a revocation/not found exception
            }

            // If database record exists, also verify hash matches
            if (receipt != null) {
                System.out.println("🔍 Comparing hashes:");
                System.out.println("   Stored hash: " + receipt.getMetadataHash());
                System.out.println("   Provided hash: " + request.getMetadataHash());

                if (!receipt.getMetadataHash().equals(request.getMetadataHash())) {
                    System.out.println("❌ Metadata hash mismatch");
                    return VerifyReceiptResponse.invalid("Metadata hash mismatch");
                }
            }

            // Get owner from blockchain if database record doesn't exist
            String ownerAddress;
            if (receipt != null) {
                ownerAddress = receipt.getOwnerAddress();
            } else {
                System.out.println("📝 Fetching owner from blockchain...");
                ownerAddress = blockchainService.getTokenOwner(request.getTokenId());
                System.out.println("   Owner: " + ownerAddress);
            }

            System.out.println("✅ Verification successful!");
            return VerifyReceiptResponse.valid(
                    request.getTokenId(),
                    ownerAddress,
                    request.getMetadataHash());

        } catch (Exception e) {
            System.err.println("❌ Exception during verification: " + e.getMessage());
            e.printStackTrace();
            return VerifyReceiptResponse.invalid("Verification failed: " + e.getMessage());
        }
    }

    /**
     * Revoke a TAR receipt
     */
    public void revokeReceipt(Long tokenId) {
        TarReceipt receipt = receiptRepository.findByTokenId(tokenId)
                .orElseThrow(() -> new RuntimeException("Receipt not found"));

        if (receipt.getRevoked()) {
            throw new RuntimeException("Receipt already revoked");
        }

        // Revoke on blockchain
        BlockchainService.RevokeResult result = blockchainService.revokeReceipt(tokenId);

        if (!result.isSuccess()) {
            throw new RuntimeException("Failed to revoke receipt on blockchain");
        }

        // Update database
        receipt.setRevoked(true);
        receipt.setRevokedAt(LocalDateTime.now());
        receiptRepository.save(receipt);
    }

    /**
     * Get receipt details
     */
    @Transactional(readOnly = true)
    public ReceiptDetailsResponse getReceiptDetails(Long tokenId) {
        TarReceipt receipt = receiptRepository.findByTokenId(tokenId)
                .orElseThrow(() -> new RuntimeException("Receipt not found"));

        return new ReceiptDetailsResponse(
                receipt.getTokenId(),
                receipt.getInvoiceNo(),
                receipt.getPurchaseDate(),
                receipt.getAmount(),
                receipt.getItemName(),
                receipt.getOwnerAddress(),
                receipt.getMetadataUri(),
                receipt.getMetadataHash(),
                receipt.getTransactionHash(),
                receipt.getRevoked(),
                receipt.getCreatedAt(),
                receipt.getRevokedAt());
    }

    /**
     * Get receipts by owner address
     */
    @Transactional(readOnly = true)
    public List<ReceiptDetailsResponse> getReceiptsByOwner(String ownerAddress) {
        return receiptRepository.findByOwnerAddress(ownerAddress)
                .stream()
                .map(receipt -> new ReceiptDetailsResponse(
                        receipt.getTokenId(),
                        receipt.getInvoiceNo(),
                        receipt.getPurchaseDate(),
                        receipt.getAmount(),
                        receipt.getItemName(),
                        receipt.getOwnerAddress(),
                        receipt.getMetadataUri(),
                        receipt.getMetadataHash(),
                        receipt.getTransactionHash(),
                        receipt.getRevoked(),
                        receipt.getCreatedAt(),
                        receipt.getRevokedAt()))
                .collect(Collectors.toList());
    }

    /**
     * Get active receipts by owner
     */
    @Transactional(readOnly = true)
    public List<ReceiptDetailsResponse> getActiveReceiptsByOwner(String ownerAddress) {
        return receiptRepository.findActiveReceiptsByOwner(ownerAddress)
                .stream()
                .map(receipt -> new ReceiptDetailsResponse(
                        receipt.getTokenId(),
                        receipt.getInvoiceNo(),
                        receipt.getPurchaseDate(),
                        receipt.getAmount(),
                        receipt.getItemName(),
                        receipt.getOwnerAddress(),
                        receipt.getMetadataUri(),
                        receipt.getMetadataHash(),
                        receipt.getTransactionHash(),
                        receipt.getRevoked(),
                        receipt.getCreatedAt(),
                        receipt.getRevokedAt()))
                .collect(Collectors.toList());
    }
}
