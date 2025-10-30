package com.tar.verification.client;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tar.verification.dto.TokenMetadata;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Mono;

import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

/**
 * Unit tests for MetadataClient
 */
@ExtendWith(MockitoExtension.class)
class MetadataClientTest {

    @Mock
    private WebClient webClient;

    @Mock
    private WebClient.RequestHeadersUriSpec requestHeadersUriSpec;

    @Mock
    private WebClient.RequestHeadersSpec requestHeadersSpec;

    @Mock
    private WebClient.ResponseSpec responseSpec;

    private MetadataClient metadataClient;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        metadataClient = new MetadataClient(webClient);
        objectMapper = new ObjectMapper();
    }

    @Test
    void fetchMetadata_WithValidUrl_ShouldReturnMetadata() throws Exception {
        // Given
        String metadataUrl = "https://api.example.com/metadata/123";
        TokenMetadata expectedMetadata = createTestMetadata();
        String jsonResponse = objectMapper.writeValueAsString(expectedMetadata);

        setupWebClientMocks(jsonResponse);

        // When
        TokenMetadata actualMetadata = metadataClient.fetchMetadata(metadataUrl);

        // Then
        assertNotNull(actualMetadata);
        assertEquals(expectedMetadata.getName(), actualMetadata.getName());
        assertEquals(expectedMetadata.getDescription(), actualMetadata.getDescription());
        assertEquals(expectedMetadata.getSerialNumber(), actualMetadata.getSerialNumber());

        verify(webClient).get();
        verify(requestHeadersUriSpec).uri(metadataUrl);
    }

    @Test
    void fetchMetadata_WithInvalidUrl_ShouldThrowException() {
        // Given
        String invalidUrl = "https://invalid-url.com/metadata/123";

        when(webClient.get()).thenReturn(requestHeadersUriSpec);
        when(requestHeadersUriSpec.uri(invalidUrl)).thenReturn(requestHeadersSpec);
        when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.bodyToMono(TokenMetadata.class))
                .thenReturn(Mono.error(new WebClientResponseException(404, "Not Found", null, null, null)));

        // When & Then
        assertThrows(RuntimeException.class, () -> {
            metadataClient.fetchMetadata(invalidUrl);
        });
    }

    @Test
    void fetchMetadata_WithMalformedJson_ShouldThrowException() {
        // Given
        String metadataUrl = "https://api.example.com/metadata/123";
        String malformedJson = "{ invalid json }";

        setupWebClientMocks(malformedJson);

        // When & Then
        assertThrows(RuntimeException.class, () -> {
            metadataClient.fetchMetadata(metadataUrl);
        });
    }

    @Test
    void fetchMetadata_WithNullUrl_ShouldThrowException() {
        // When & Then
        assertThrows(IllegalArgumentException.class, () -> {
            metadataClient.fetchMetadata(null);
        });
    }

    @Test
    void fetchMetadata_WithEmptyUrl_ShouldThrowException() {
        // When & Then
        assertThrows(IllegalArgumentException.class, () -> {
            metadataClient.fetchMetadata("");
        });
    }

    @Test
    void fetchMetadata_WithTimeout_ShouldThrowException() {
        // Given
        String metadataUrl = "https://api.example.com/metadata/123";

        when(webClient.get()).thenReturn(requestHeadersUriSpec);
        when(requestHeadersUriSpec.uri(metadataUrl)).thenReturn(requestHeadersSpec);
        when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.bodyToMono(TokenMetadata.class))
                .thenReturn(Mono.error(new RuntimeException("Timeout")));

        // When & Then
        assertThrows(RuntimeException.class, () -> {
            metadataClient.fetchMetadata(metadataUrl);
        });
    }

    @Test
    void fetchMetadata_WithServerError_ShouldThrowException() {
        // Given
        String metadataUrl = "https://api.example.com/metadata/123";

        when(webClient.get()).thenReturn(requestHeadersUriSpec);
        when(requestHeadersUriSpec.uri(metadataUrl)).thenReturn(requestHeadersSpec);
        when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.bodyToMono(TokenMetadata.class))
                .thenReturn(Mono.error(new WebClientResponseException(500, "Internal Server Error", null, null, null)));

        // When & Then
        assertThrows(RuntimeException.class, () -> {
            metadataClient.fetchMetadata(metadataUrl);
        });
    }

    private void setupWebClientMocks(String jsonResponse) {
        try {
            TokenMetadata metadata = objectMapper.readValue(jsonResponse, TokenMetadata.class);

            when(webClient.get()).thenReturn(requestHeadersUriSpec);
            when(requestHeadersUriSpec.uri(anyString())).thenReturn(requestHeadersSpec);
            when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);
            when(responseSpec.bodyToMono(TokenMetadata.class)).thenReturn(Mono.just(metadata));
        } catch (Exception e) {
            throw new RuntimeException("Failed to setup mocks", e);
        }
    }

    private TokenMetadata createTestMetadata() {
        TokenMetadata metadata = new TokenMetadata();
        metadata.setName("Test Asset Receipt");
        metadata.setDescription("Test description");
        metadata.setImage("https://example.com/image.png");
        metadata.setSerialNumber("TAR-2024-001");
        metadata.setIssuer("Test Issuer");
        metadata.setIssueDate("2024-01-01");

        Map<String, Object> attributes = new HashMap<>();
        attributes.put("propertyType", "Commercial");
        attributes.put("location", "Taipei");
        metadata.setAttributes(attributes);

        return metadata;
    }
}
