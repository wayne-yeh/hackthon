package com.tar.verification.client;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.web3j.abi.FunctionEncoder;
import org.web3j.abi.FunctionReturnDecoder;
import org.web3j.abi.TypeReference;
import org.web3j.abi.datatypes.Address;
import org.web3j.abi.datatypes.Bool;
import org.web3j.abi.datatypes.Function;
import org.web3j.abi.datatypes.Type;
import org.web3j.abi.datatypes.Utf8String;
import org.web3j.abi.datatypes.generated.Uint256;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.core.DefaultBlockParameterName;
import org.web3j.protocol.core.methods.request.Transaction;
import org.web3j.protocol.core.methods.response.EthCall;

import java.math.BigInteger;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.CompletableFuture;

/**
 * Client for interacting with the TAR Receipt smart contract
 */
@Component
public class BlockchainClient {

    private static final Logger logger = LoggerFactory.getLogger(BlockchainClient.class);

    private final Web3j web3j;
    private final String contractAddress;

    public BlockchainClient(Web3j web3j, String contractAddress) {
        this.web3j = web3j;
        this.contractAddress = contractAddress;
    }

    /**
     * Get the owner of a token
     * 
     * @param tokenId Token ID
     * @return Owner address
     * @throws IllegalArgumentException if tokenId is null or invalid
     */
    public String getTokenOwner(Long tokenId) {
        validateTokenId(tokenId);

        try {
            Function function = new Function(
                    "ownerOf",
                    Arrays.asList(new Uint256(BigInteger.valueOf(tokenId))),
                    Arrays.asList(new TypeReference<Address>() {
                    }));

            String encodedFunction = FunctionEncoder.encode(function);
            EthCall response = callContract(encodedFunction);

            List<Type> result = FunctionReturnDecoder.decode(response.getValue(), function.getOutputParameters());
            String owner = result.get(0).getValue().toString();

            logger.debug("Token {} owner: {}", tokenId, owner);
            return owner;

        } catch (Exception e) {
            logger.error("Error getting token owner for tokenId: {}", tokenId, e);
            throw new RuntimeException("Failed to get token owner", e);
        }
    }

    /**
     * Get the token URI
     * 
     * @param tokenId Token ID
     * @return Token URI
     * @throws IllegalArgumentException if tokenId is null or invalid
     */
    public String getTokenURI(Long tokenId) {
        validateTokenId(tokenId);

        try {
            Function function = new Function(
                    "tokenURI",
                    Arrays.asList(new Uint256(BigInteger.valueOf(tokenId))),
                    Arrays.asList(new TypeReference<Utf8String>() {
                    }));

            String encodedFunction = FunctionEncoder.encode(function);
            EthCall response = callContract(encodedFunction);

            List<Type> result = FunctionReturnDecoder.decode(response.getValue(), function.getOutputParameters());
            String tokenURI = result.get(0).getValue().toString();

            logger.debug("Token {} URI: {}", tokenId, tokenURI);
            return tokenURI;

        } catch (Exception e) {
            logger.error("Error getting token URI for tokenId: {}", tokenId, e);
            throw new RuntimeException("Failed to get token URI", e);
        }
    }

    /**
     * Get the stored hash for a token
     * 
     * @param tokenId Token ID
     * @return Stored hash
     * @throws IllegalArgumentException if tokenId is null or invalid
     */
    public String getStoredHash(Long tokenId) {
        validateTokenId(tokenId);

        try {
            Function function = new Function(
                    "getTokenHash",
                    Arrays.asList(new Uint256(BigInteger.valueOf(tokenId))),
                    Arrays.asList(new TypeReference<Utf8String>() {
                    }));

            String encodedFunction = FunctionEncoder.encode(function);
            EthCall response = callContract(encodedFunction);

            List<Type> result = FunctionReturnDecoder.decode(response.getValue(), function.getOutputParameters());
            String hash = result.get(0).getValue().toString();

            logger.debug("Token {} stored hash: {}", tokenId, hash);
            return hash;

        } catch (Exception e) {
            logger.error("Error getting stored hash for tokenId: {}", tokenId, e);
            throw new RuntimeException("Failed to get stored hash", e);
        }
    }

    /**
     * Check if a token is revoked
     * 
     * @param tokenId Token ID
     * @return true if token is revoked, false otherwise
     * @throws IllegalArgumentException if tokenId is null or invalid
     */
    public boolean isTokenRevoked(Long tokenId) {
        validateTokenId(tokenId);

        try {
            Function function = new Function(
                    "isTokenRevoked",
                    Arrays.asList(new Uint256(BigInteger.valueOf(tokenId))),
                    Arrays.asList(new TypeReference<Bool>() {
                    }));

            String encodedFunction = FunctionEncoder.encode(function);
            EthCall response = callContract(encodedFunction);

            List<Type> result = FunctionReturnDecoder.decode(response.getValue(), function.getOutputParameters());
            boolean revoked = (Boolean) result.get(0).getValue();

            logger.debug("Token {} revoked status: {}", tokenId, revoked);
            return revoked;

        } catch (Exception e) {
            logger.error("Error checking revocation status for tokenId: {}", tokenId, e);
            throw new RuntimeException("Failed to check revocation status", e);
        }
    }

    /**
     * Verify token by getting its stored hash
     * 
     * @param tokenId Token ID
     * @return Stored hash for verification
     * @throws IllegalArgumentException if tokenId is null or invalid
     */
    public String verifyToken(Long tokenId) {
        return getStoredHash(tokenId);
    }

    /**
     * Call the smart contract
     * 
     * @param encodedFunction Encoded function call
     * @return EthCall response
     */
    private EthCall callContract(String encodedFunction) {
        try {
            Transaction transaction = Transaction.createEthCallTransaction(
                    null, // from address (not needed for view functions)
                    contractAddress,
                    encodedFunction);

            CompletableFuture<EthCall> future = web3j.ethCall(transaction, DefaultBlockParameterName.LATEST)
                    .sendAsync();
            EthCall response = future.get();

            if (response.hasError()) {
                throw new RuntimeException("Blockchain call failed: " + response.getError().getMessage());
            }

            return response;

        } catch (Exception e) {
            logger.error("Error calling smart contract", e);
            throw new RuntimeException("Failed to call smart contract", e);
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
