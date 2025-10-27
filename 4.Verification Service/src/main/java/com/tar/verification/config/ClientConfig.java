package com.tar.verification.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.http.HttpService;

import java.time.Duration;

/**
 * Configuration for external clients and services
 */
@Configuration
public class ClientConfig {

    @Value("${blockchain.rpc-url}")
    private String blockchainRpcUrl;

    @Value("${blockchain.contract-address}")
    private String contractAddress;

    @Value("${external.metadata-service.timeout:10s}")
    private Duration metadataTimeout;

    /**
     * Web3j client for blockchain interactions
     */
    @Bean
    public Web3j web3j() {
        return Web3j.build(new HttpService(blockchainRpcUrl));
    }

    /**
     * WebClient for HTTP requests to external services
     */
    @Bean
    public WebClient webClient() {
        return WebClient.builder()
                .codecs(configurer -> configurer.defaultCodecs().maxInMemorySize(1024 * 1024)) // 1MB
                .build();
    }

    /**
     * Blockchain client for contract interactions
     */
    @Bean
    public com.tar.verification.client.BlockchainClient blockchainClient(Web3j web3j) {
        return new com.tar.verification.client.BlockchainClient(web3j, contractAddress);
    }

    /**
     * Metadata client for fetching token metadata
     */
    @Bean
    public com.tar.verification.client.MetadataClient metadataClient(WebClient webClient) {
        return new com.tar.verification.client.MetadataClient(webClient);
    }
}
