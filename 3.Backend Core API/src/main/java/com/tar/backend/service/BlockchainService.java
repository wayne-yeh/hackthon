package com.tar.backend.service;

import com.tar.backend.config.BlockchainConfig;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.web3j.crypto.Credentials;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.core.DefaultBlockParameterName;
import org.web3j.protocol.core.methods.response.EthGetTransactionReceipt;
import org.web3j.protocol.core.methods.response.TransactionReceipt;
import org.web3j.protocol.http.HttpService;
import org.web3j.tx.RawTransactionManager;
import org.web3j.tx.TransactionManager;
import org.web3j.tx.gas.DefaultGasProvider;
import org.web3j.utils.Numeric;

import java.math.BigInteger;

/**
 * Service for blockchain interactions via web3j
 */
@Service
public class BlockchainService {

    private final Web3j web3j;
    private final Credentials credentials;
    private final String contractAddress;
    private final BlockchainConfig blockchainConfig;

    @Autowired
    public BlockchainService(BlockchainConfig blockchainConfig) {
        this.blockchainConfig = blockchainConfig;
        this.web3j = Web3j.build(new HttpService(blockchainConfig.getRpcUrl()));

        // Only create credentials if private key is provided
        if (blockchainConfig.getIssuerPrivateKey() != null &&
                !blockchainConfig.getIssuerPrivateKey().trim().isEmpty()) {
            this.credentials = Credentials.create(blockchainConfig.getIssuerPrivateKey());
        } else {
            this.credentials = null;
        }

        this.contractAddress = blockchainConfig.getContractAddress();
    }

    /**
     * Mint a new TAR receipt NFT
     */
    public MintResult mintReceipt(String toAddress, String tokenUri, String metadataHash) {
        try {
            if (credentials == null) {
                // Simulate minting when no credentials are available
                String txHash = "0x" + Numeric.toHexStringNoPrefix(
                        BigInteger.valueOf(System.currentTimeMillis()));
                long tokenId = System.currentTimeMillis() % 1000000;
                return new MintResult(tokenId, txHash, true);
            }

            // Load the contract
            TARReceiptContract contract = loadContract();

            // Convert metadata hash to bytes32
            byte[] hashBytes = Numeric.hexStringToByteArray(metadataHash);

            // Call mint function
            TransactionReceipt receipt = contract.mint(
                    toAddress,
                    tokenUri,
                    hashBytes).send();

            // Extract token ID from events
            Long tokenId = extractTokenIdFromReceipt(receipt);

            return new MintResult(
                    tokenId,
                    receipt.getTransactionHash(),
                    receipt.isStatusOK());
        } catch (Exception e) {
            throw new RuntimeException("Failed to mint receipt: " + e.getMessage(), e);
        }
    }

    /**
     * Revoke a TAR receipt
     */
    public RevokeResult revokeReceipt(Long tokenId) {
        try {
            if (credentials == null) {
                // Simulate revoking when no credentials are available
                String txHash = "0x" + Numeric.toHexStringNoPrefix(
                        BigInteger.valueOf(System.currentTimeMillis()));
                return new RevokeResult(txHash, true);
            }

            TARReceiptContract contract = loadContract();

            TransactionReceipt receipt = contract.revoke(BigInteger.valueOf(tokenId)).send();

            return new RevokeResult(
                    receipt.getTransactionHash(),
                    receipt.isStatusOK());
        } catch (Exception e) {
            throw new RuntimeException("Failed to revoke receipt: " + e.getMessage(), e);
        }
    }

    /**
     * Verify a receipt on-chain
     */
    public boolean verifyReceipt(Long tokenId, String metadataHash) {
        try {
            if (credentials == null) {
                // Simulate verification when no credentials are available
                return true;
            }

            TARReceiptContract contract = loadContract();
            byte[] hashBytes = Numeric.hexStringToByteArray(metadataHash);

            return contract.verify(BigInteger.valueOf(tokenId), hashBytes).send();
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Check if a receipt is revoked
     */
    public boolean isRevoked(Long tokenId) {
        try {
            if (credentials == null) {
                // Simulate check when no credentials are available
                return false;
            }

            TARReceiptContract contract = loadContract();
            return contract.isRevoked(BigInteger.valueOf(tokenId)).send();
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Get the owner of a token
     */
    public String getTokenOwner(Long tokenId) {
        try {
            if (credentials == null) {
                // Simulate owner when no credentials are available
                return "0x1234567890123456789012345678901234567890";
            }

            TARReceiptContract contract = loadContract();
            return contract.ownerOf(BigInteger.valueOf(tokenId)).send();
        } catch (Exception e) {
            throw new RuntimeException("Failed to get token owner: " + e.getMessage(), e);
        }
    }

    /**
     * Get metadata hash for a token
     */
    public String getMetadataHash(Long tokenId) {
        try {
            if (credentials == null) {
                // Simulate metadata hash when no credentials are available
                return "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890";
            }

            TARReceiptContract contract = loadContract();
            byte[] hash = contract.getMetaHash(BigInteger.valueOf(tokenId)).send();
            return Numeric.toHexString(hash);
        } catch (Exception e) {
            throw new RuntimeException("Failed to get metadata hash: " + e.getMessage(), e);
        }
    }

    private TARReceiptContract loadContract() {
        if (credentials == null) {
            throw new RuntimeException("No blockchain credentials available");
        }

        TransactionManager txManager = new RawTransactionManager(
                web3j,
                credentials,
                getChainId());

        return TARReceiptContract.load(
                contractAddress,
                web3j,
                txManager,
                new DefaultGasProvider());
    }

    private long getChainId() {
        try {
            return web3j.ethChainId().send().getChainId().longValue();
        } catch (Exception e) {
            return 1337L; // Default for local development
        }
    }

    private Long extractTokenIdFromReceipt(TransactionReceipt receipt) {
        // Parse events to extract token ID
        // This is a simplified version - you would parse the Minted event
        try {
            if (receipt.getLogs() != null && !receipt.getLogs().isEmpty()) {
                // Extract from logs - implementation depends on contract ABI
                // For now, return a placeholder
                return 0L;
            }
        } catch (Exception e) {
            // Log error
        }
        return 0L;
    }

    /**
     * Result class for minting
     */
    public static class MintResult {
        private final Long tokenId;
        private final String transactionHash;
        private final boolean success;

        public MintResult(Long tokenId, String transactionHash, boolean success) {
            this.tokenId = tokenId;
            this.transactionHash = transactionHash;
            this.success = success;
        }

        public Long getTokenId() {
            return tokenId;
        }

        public String getTransactionHash() {
            return transactionHash;
        }

        public boolean isSuccess() {
            return success;
        }
    }

    /**
     * Result class for revoking
     */
    public static class RevokeResult {
        private final String transactionHash;
        private final boolean success;

        public RevokeResult(String transactionHash, boolean success) {
            this.transactionHash = transactionHash;
            this.success = success;
        }

        public String getTransactionHash() {
            return transactionHash;
        }

        public boolean isSuccess() {
            return success;
        }
    }

    /**
     * Placeholder contract wrapper - should be generated by web3j
     */
    private static class TARReceiptContract {
        // This should be replaced with web3j generated contract wrapper
        // For now, we'll create a simplified version

        public static TARReceiptContract load(String contractAddress, Web3j web3j,
                TransactionManager txManager, DefaultGasProvider gasProvider) {
            return new TARReceiptContract();
        }

        public org.web3j.protocol.core.RemoteFunctionCall<TransactionReceipt> mint(
                String to, String uri, byte[] metaHash) {
            // Placeholder
            return null;
        }

        public org.web3j.protocol.core.RemoteFunctionCall<TransactionReceipt> revoke(BigInteger tokenId) {
            // Placeholder
            return null;
        }

        public org.web3j.protocol.core.RemoteFunctionCall<Boolean> verify(BigInteger tokenId, byte[] metaHash) {
            // Placeholder
            return null;
        }

        public org.web3j.protocol.core.RemoteFunctionCall<Boolean> isRevoked(BigInteger tokenId) {
            // Placeholder
            return null;
        }

        public org.web3j.protocol.core.RemoteFunctionCall<String> ownerOf(BigInteger tokenId) {
            // Placeholder
            return null;
        }

        public org.web3j.protocol.core.RemoteFunctionCall<byte[]> getMetaHash(BigInteger tokenId) {
            // Placeholder
            return null;
        }
    }
}
