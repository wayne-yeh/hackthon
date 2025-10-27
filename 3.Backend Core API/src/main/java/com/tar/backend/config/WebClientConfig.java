package com.tar.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

/**
 * Configuration for WebClient
 */
@Configuration
public class WebClientConfig {

    @Value("${metadata-service.base-url}")
    private String metadataServiceBaseUrl;

    @Bean
    public WebClient metadataServiceWebClient() {
        return WebClient.builder()
                .baseUrl(metadataServiceBaseUrl)
                .build();
    }
}

