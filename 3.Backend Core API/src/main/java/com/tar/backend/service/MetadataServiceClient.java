package com.tar.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

/**
 * Client service for interacting with Metadata Service
 */
@Service
public class MetadataServiceClient {

    private final WebClient webClient;

    @Autowired
    public MetadataServiceClient(WebClient metadataServiceWebClient) {
        this.webClient = metadataServiceWebClient;
    }

    /**
     * Upload receipt metadata to metadata service
     */
    public MetadataUploadResult uploadMetadata(String invoiceNo, LocalDate purchaseDate,
            BigDecimal amount, String itemName,
            String ownerAddress, String imageBase64) {

        try {
            // Create multipart form data using MultiValueMap
            org.springframework.util.MultiValueMap<String, String> formData = new org.springframework.util.LinkedMultiValueMap<>();
            formData.add("invoiceNo", invoiceNo);
            formData.add("purchaseDate", purchaseDate.toString());
            formData.add("amount", amount.toString());
            formData.add("itemName", itemName);
            formData.add("ownerAddress", ownerAddress);
            if (imageBase64 != null && !imageBase64.isEmpty()) {
                formData.add("imageBase64", imageBase64);
            }

            JsonNode response = webClient.post()
                    .uri("/api/metadata/receipts")
                    .contentType(MediaType.MULTIPART_FORM_DATA)
                    .bodyValue(formData)
                    .retrieve()
                    .bodyToMono(JsonNode.class)
                    .block();

            if (response != null) {
                String metadataUri = response.get("metadataUrl").asText();
                String metadataHash = response.get("metaHash").asText();
                return new MetadataUploadResult(metadataUri, metadataHash);
            }

            throw new RuntimeException("Failed to upload metadata: Empty response");
        } catch (Exception e) {
            throw new RuntimeException("Failed to upload metadata: " + e.getMessage(), e);
        }
    }

    /**
     * Verify metadata hash
     */
    public boolean verifyMetadataHash(String metadataUri, String expectedHash) {
        try {
            Map<String, String> request = new HashMap<>();
            request.put("metadataUri", metadataUri);
            request.put("expectedHash", expectedHash);

            JsonNode response = webClient.post()
                    .uri("/api/v1/metadata/verify")
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(JsonNode.class)
                    .block();

            return response != null && response.get("valid").asBoolean();
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Result class for metadata upload
     */
    public static class MetadataUploadResult {
        private final String metadataUri;
        private final String metadataHash;

        public MetadataUploadResult(String metadataUri, String metadataHash) {
            this.metadataUri = metadataUri;
            this.metadataHash = metadataHash;
        }

        public String getMetadataUri() {
            return metadataUri;
        }

        public String getMetadataHash() {
            return metadataHash;
        }
    }
}
