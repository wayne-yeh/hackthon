package com.tar.verification.client;

import com.tar.verification.dto.TokenMetadata;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Mono;

import java.time.Duration;

/**
 * Client for fetching metadata from external services
 */
@Component
public class MetadataClient {

    private static final Logger logger = LoggerFactory.getLogger(MetadataClient.class);
    private static final Duration TIMEOUT = Duration.ofSeconds(10);

    private final WebClient webClient;

    public MetadataClient(WebClient webClient) {
        this.webClient = webClient;
    }

    /**
     * Fetch metadata from the given URL
     * 
     * @param metadataUrl URL to fetch metadata from
     * @return TokenMetadata object
     * @throws IllegalArgumentException if metadataUrl is null or empty
     * @throws RuntimeException         if fetch fails
     */
    public TokenMetadata fetchMetadata(String metadataUrl) {
        validateMetadataUrl(metadataUrl);

        logger.debug("Fetching metadata from URL: {}", metadataUrl);

        try {
            TokenMetadata metadata = webClient
                    .get()
                    .uri(metadataUrl)
                    .retrieve()
                    .bodyToMono(TokenMetadata.class)
                    .timeout(TIMEOUT)
                    .block();

            if (metadata == null) {
                throw new RuntimeException("Received null metadata from URL: " + metadataUrl);
            }

            logger.debug("Successfully fetched metadata: {}", metadata);
            return metadata;

        } catch (WebClientResponseException e) {
            logger.error("HTTP error fetching metadata from {}: {} {}",
                    metadataUrl, e.getStatusCode(), e.getStatusText());
            throw new RuntimeException("Failed to fetch metadata: " + e.getStatusText(), e);

        } catch (Exception e) {
            logger.error("Error fetching metadata from URL: {}", metadataUrl, e);
            throw new RuntimeException("Failed to fetch metadata", e);
        }
    }

    /**
     * Check if metadata URL is accessible
     * 
     * @param metadataUrl URL to check
     * @return true if accessible, false otherwise
     */
    public boolean isMetadataAccessible(String metadataUrl) {
        if (metadataUrl == null || metadataUrl.trim().isEmpty()) {
            return false;
        }

        try {
            webClient
                    .head()
                    .uri(metadataUrl)
                    .retrieve()
                    .bodyToMono(Void.class)
                    .timeout(Duration.ofSeconds(5))
                    .block();

            return true;

        } catch (Exception e) {
            logger.debug("Metadata URL not accessible: {}", metadataUrl, e);
            return false;
        }
    }

    /**
     * Validate metadata URL
     * 
     * @param metadataUrl URL to validate
     * @throws IllegalArgumentException if URL is invalid
     */
    private void validateMetadataUrl(String metadataUrl) {
        if (metadataUrl == null || metadataUrl.trim().isEmpty()) {
            throw new IllegalArgumentException("Metadata URL cannot be null or empty");
        }

        if (!metadataUrl.startsWith("http://") && !metadataUrl.startsWith("https://")) {
            throw new IllegalArgumentException("Metadata URL must start with http:// or https://");
        }
    }
}
