package com.tar.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration for blockchain settings
 */
@Configuration
public class BlockchainConfig {

    @Value("${blockchain.rpc-url}")
    private String rpcUrl;

    @Value("${blockchain.contract-address}")
    private String contractAddress;

    @Value("${blockchain.issuer-private-key}")
    private String issuerPrivateKey;

    @Value("${blockchain.gas-price}")
    private Long gasPrice;

    @Value("${blockchain.gas-limit}")
    private Long gasLimit;

    public String getRpcUrl() {
        return rpcUrl;
    }

    public String getContractAddress() {
        return contractAddress;
    }

    public String getIssuerPrivateKey() {
        return issuerPrivateKey;
    }

    public Long getGasPrice() {
        return gasPrice;
    }

    public Long getGasLimit() {
        return gasLimit;
    }
}

