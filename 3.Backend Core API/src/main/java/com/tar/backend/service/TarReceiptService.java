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
            MetadataServiceClient.MetadataUploadResult metadataResult = metadataServiceClient.uploadMetadata(
                    request.getInvoiceNo(),
                    request.getPurchaseDate(),
                    request.getAmount(),
                    request.getItemName(),
                    request.getOwnerAddress(),
                    request.getImageBase64());

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
            // Check in database
            Optional<TarReceipt> receiptOpt = receiptRepository.findByTokenId(request.getTokenId());

            if (receiptOpt.isEmpty()) {
                return VerifyReceiptResponse.invalid("Receipt not found");
            }

            TarReceipt receipt = receiptOpt.get();

            // Check if revoked
            if (receipt.getRevoked()) {
                return VerifyReceiptResponse.revoked(receipt.getTokenId(), receipt.getOwnerAddress());
            }

            // Verify on blockchain
            boolean isValidOnChain = blockchainService.verifyReceipt(
                    request.getTokenId(),
                    request.getMetadataHash());

            if (!isValidOnChain) {
                return VerifyReceiptResponse.invalid("Blockchain verification failed");
            }

            // Verify hash matches
            if (!receipt.getMetadataHash().equals(request.getMetadataHash())) {
                return VerifyReceiptResponse.invalid("Metadata hash mismatch");
            }

            return VerifyReceiptResponse.valid(
                    receipt.getTokenId(),
                    receipt.getOwnerAddress(),
                    receipt.getMetadataHash());

        } catch (Exception e) {
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
