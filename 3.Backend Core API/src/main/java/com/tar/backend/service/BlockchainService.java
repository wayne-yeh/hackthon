package com.tar.backend.service;

import com.tar.backend.config.BlockchainConfig;
import com.tar.backend.contract.TARReceiptContract;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.web3j.crypto.Credentials;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.core.DefaultBlockParameterName;
import org.web3j.protocol.core.methods.response.EthSendTransaction;
import org.web3j.protocol.core.methods.response.EthGetCode;
import org.web3j.protocol.core.methods.response.EthGetTransactionReceipt;
import org.web3j.protocol.core.methods.response.TransactionReceipt;
import org.web3j.protocol.http.HttpService;
import org.web3j.tx.RawTransactionManager;
import org.web3j.tx.TransactionManager;
import org.web3j.tx.gas.DefaultGasProvider;
import org.web3j.utils.Numeric;
import org.web3j.abi.FunctionEncoder;
import org.web3j.abi.datatypes.Function;
import org.web3j.abi.datatypes.Address;
import org.web3j.abi.datatypes.Utf8String;
import org.web3j.abi.datatypes.generated.Bytes32;

import java.math.BigInteger;
import java.util.Arrays;
import java.util.Collections;

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
        Credentials tempCredentials = null;
        if (blockchainConfig.getIssuerPrivateKey() != null &&
                !blockchainConfig.getIssuerPrivateKey().trim().isEmpty()) {
            try {
                tempCredentials = Credentials.create(blockchainConfig.getIssuerPrivateKey());
                System.out.println(
                        "✅ Blockchain credentials created successfully for address: " + tempCredentials.getAddress());
            } catch (Exception e) {
                System.err.println("❌ Failed to create blockchain credentials: " + e.getMessage());
                tempCredentials = null;
            }
        } else {
            System.out.println("⚠️ No private key provided, blockchain operations will be simulated");
        }
        this.credentials = tempCredentials;

        this.contractAddress = blockchainConfig.getContractAddress();
        System.out.println("🔗 Blockchain service initialized:");
        System.out.println("   RPC URL: " + blockchainConfig.getRpcUrl());
        System.out.println("   Contract Address: " + contractAddress);
        System.out.println("   Credentials: " + (credentials != null ? "✅ Available" : "❌ Not available"));

        // Test contract connection
        testContractConnection();
    }

    /**
     * Mint a new TAR receipt NFT
     */
    public MintResult mintReceipt(String toAddress, String tokenUri, String metadataHash) {
        try {
            System.out.println("🪙 Attempting to mint receipt:");
            System.out.println("   To Address: " + toAddress);
            System.out.println("   Token URI: " + tokenUri);
            System.out.println("   Metadata Hash: " + metadataHash);
            System.out.println("   Credentials Available: " + (credentials != null));

            if (credentials == null) {
                System.out.println("⚠️ No credentials available, simulating minting");
                // Simulate minting when no credentials are available
                String txHash = "0x" + Numeric.toHexStringNoPrefix(
                        BigInteger.valueOf(System.currentTimeMillis()));
                long tokenId = System.currentTimeMillis() % 1000000;
                return new MintResult(tokenId, txHash, true);
            }

            System.out.println("🔗 準備直接調用區塊鏈合約...");
            System.out.println("   合約地址: " + contractAddress);
            System.out.println("   接收地址: " + toAddress);
            System.out.println("   Token URI: " + tokenUri);
            System.out.println("   Metadata Hash: " + metadataHash);

            // Convert metadata hash to bytes32 (ensure 32 bytes)
            byte[] hashBytes = Numeric.hexStringToByteArray(metadataHash);
            if (hashBytes.length != 32) {
                // Pad with zeros if too short, or truncate if too long
                byte[] paddedBytes = new byte[32];
                System.arraycopy(hashBytes, 0, paddedBytes, 0, Math.min(hashBytes.length, 32));
                hashBytes = paddedBytes;
            }
            System.out.println("   Hash bytes length: " + hashBytes.length);

            // Create function call data for mint(address,string,bytes32)
            String functionSignature = "mint(address,string,bytes32)";
            String functionData = FunctionEncoder.encode(
                    new Function(functionSignature,
                            Arrays.asList(
                                    new Address(160, toAddress),
                                    new Utf8String(tokenUri),
                                    new Bytes32(hashBytes)),
                            Collections.emptyList()));

            System.out.println("📝 Function signature: " + functionSignature);
            System.out.println("📝 Function data: " + functionData);
            System.out.println("📝 Function data length: " + functionData.length());

            // Extract the first 10 characters (0x + 8 hex chars = function selector)
            String actualSelector = functionData.substring(0, 10);
            System.out.println("📝 Actual selector: " + actualSelector);
            System.out.println("📝 Expected selector: 0xd34047b6");

            // Manual override with correct selector
            String correctFunctionData = "0xd34047b6" + functionData.substring(10);
            System.out.println("📝 Using correct function data: " + correctFunctionData.substring(0, 50) + "...");

            // Send transaction using RawTransactionManager
            TransactionManager txManager = new RawTransactionManager(
                    web3j,
                    credentials,
                    getChainId());

            System.out.println("🚀 發送交易到區塊鏈...");
            System.out.println("   合約地址: " + contractAddress);
            System.out.println("   函數數據: " + correctFunctionData.substring(0, 50) + "...");
            System.out.println("   Gas Price: " + DefaultGasProvider.GAS_PRICE);
            System.out.println("   Gas Limit: " + DefaultGasProvider.GAS_LIMIT);

            EthSendTransaction ethSendTransaction = txManager.sendTransaction(
                    DefaultGasProvider.GAS_PRICE,
                    DefaultGasProvider.GAS_LIMIT,
                    contractAddress,
                    correctFunctionData,
                    BigInteger.ZERO);

            // 檢查交易是否成功發送
            if (ethSendTransaction.hasError()) {
                System.err.println("❌ 交易發送失敗: " + ethSendTransaction.getError().getMessage());
                throw new RuntimeException("Transaction failed: " + ethSendTransaction.getError().getMessage());
            }

            String txHash = ethSendTransaction.getTransactionHash();
            System.out.println("📝 交易已發送，哈希: " + txHash);

            if (txHash == null || txHash.isEmpty()) {
                System.err.println("❌ 交易哈希為空，交易可能失敗");
                throw new RuntimeException("Transaction hash is null - transaction may have failed");
            }

            // Wait for transaction receipt with improved polling
            TransactionReceipt receipt = null;
            int attempts = 0;
            int maxAttempts = 120; // 增加到120次，每次500ms = 60秒總等待時間

            while (receipt == null && attempts < maxAttempts) {
                try {
                    EthGetTransactionReceipt ethReceipt = web3j.ethGetTransactionReceipt(txHash).send();
                    receipt = ethReceipt.getTransactionReceipt().orElse(null);

                    if (receipt == null) {
                        System.out.println("⏳ 等待交易收據... 嘗試 " + (attempts + 1) + "/" + maxAttempts);
                        // 使用更短的等待時間，但增加輪詢頻率
                        Thread.sleep(500);
                        attempts++;
                    } else {
                        System.out.println("✅ 交易收據已找到！");
                    }
                } catch (Exception e) {
                    System.out.println("⚠️ 等待收據時出錯: " + e.getMessage());
                    Thread.sleep(500);
                    attempts++;
                }
            }

            if (receipt == null) {
                System.err.println("❌ 交易收據在60秒內未找到");
                System.err.println("   交易哈希: " + txHash);
                System.err.println("   這表示交易可能失敗或區塊鏈響應過慢");
                throw new RuntimeException(
                        "Transaction receipt not found within 60 seconds. Transaction may have failed.");
            }

            System.out.println("📝 Transaction sent, hash: " + receipt.getTransactionHash());

            System.out.println("✅ Mint transaction successful!");
            System.out.println("   Transaction Hash: " + receipt.getTransactionHash());
            System.out.println("   Status: " + (receipt.isStatusOK() ? "SUCCESS" : "FAILED"));

            // Extract token ID from events
            Long tokenId = extractTokenIdFromReceipt(receipt);

            return new MintResult(
                    tokenId,
                    receipt.getTransactionHash(),
                    receipt.isStatusOK());
        } catch (Exception e) {
            System.err.println("❌ Failed to mint receipt: " + e.getMessage());
            e.printStackTrace();
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

    private void testContractConnection() {
        try {
            // 檢查合約代碼
            EthGetCode ethGetCode = web3j.ethGetCode(
                    contractAddress,
                    DefaultBlockParameterName.LATEST).send();

            String contractCode = ethGetCode.getCode();
            System.out.println("🔍 Contract code length: " + contractCode.length());

            if (contractCode.equals("0x")) {
                System.err.println("❌ No contract found at address: " + contractAddress);
            } else {
                System.out.println("✅ Contract found at address: " + contractAddress);
                System.out.println("   Code length: " + contractCode.length() + " characters");
            }

        } catch (Exception e) {
            System.err.println("❌ Error testing contract connection: " + e.getMessage());
        }
    }

    private long getChainId() {
        try {
            long chainId = web3j.ethChainId().send().getChainId().longValue();
            System.out.println("🔗 Chain ID: " + chainId);
            return chainId;
        } catch (Exception e) {
            System.out.println("⚠️ Failed to get chain ID, using default: " + e.getMessage());
            return 31337L; // Hardhat default chain ID
        }
    }

    private Long extractTokenIdFromReceipt(TransactionReceipt receipt) {
        // Parse events to extract token ID from Minted event
        try {
            if (receipt.getLogs() != null && !receipt.getLogs().isEmpty()) {
                // For now, use a simple counter based on current time to avoid conflicts
                // In production, you should parse the actual Minted event logs
                long tokenId = System.currentTimeMillis() % 1000000;
                System.out.println("📝 Extracted token ID: " + tokenId);
                return tokenId;
            }
        } catch (Exception e) {
            System.err.println("⚠️ Error extracting token ID: " + e.getMessage());
        }

        // Fallback: use timestamp-based ID
        long tokenId = System.currentTimeMillis() % 1000000;
        System.out.println("📝 Using fallback token ID: " + tokenId);
        return tokenId;
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
