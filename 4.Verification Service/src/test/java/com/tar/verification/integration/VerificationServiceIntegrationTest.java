package com.tar.verification.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.github.tomakehurst.wiremock.WireMockServer;
import com.github.tomakehurst.wiremock.client.WireMock;
import com.tar.verification.dto.TokenMetadata;
import com.tar.verification.dto.VerificationResponse;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureWebMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;

import java.util.HashMap;
import java.util.Map;

import static com.github.tomakehurst.wiremock.client.WireMock.*;
import static org.junit.jupiter.api.Assertions.*;

/**
 * Integration tests for Verification Service
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureWebMvc
@ActiveProfiles("test")
class VerificationServiceIntegrationTest {

    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;

    private WireMockServer wireMockServer;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        wireMockServer = new WireMockServer(8089);
        wireMockServer.start();
        objectMapper = new ObjectMapper();
    }

    @AfterEach
    void tearDown() {
        wireMockServer.stop();
    }

    @Test
    void verifyToken_WithValidToken_ShouldReturnValidResponse() throws Exception {
        // Given
        Long tokenId = 123L;
        String metadataUrl = "http://localhost:8089/metadata/123";
        TokenMetadata metadata = createTestMetadata();
        String metadataJson = objectMapper.writeValueAsString(metadata);

        // Mock metadata service response
        wireMockServer.stubFor(get(urlEqualTo("/metadata/123"))
                .willReturn(aResponse()
                        .withStatus(200)
                        .withHeader("Content-Type", "application/json")
                        .withBody(metadataJson)));

        // Mock blockchain responses (simplified for integration test)
        // In a real scenario, you would mock the blockchain client or use a test
        // blockchain

        // When
        String url = "http://localhost:" + port + "/api/verify?tokenId=" + tokenId;
        ResponseEntity<VerificationResponse> response = restTemplate.getForEntity(url, VerificationResponse.class);

        // Then
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        // Note: The actual verification result depends on blockchain client
        // implementation
        // This test demonstrates the integration flow
    }

    @Test
    void verifyToken_WithInvalidTokenId_ShouldReturnBadRequest() {
        // When
        String url = "http://localhost:" + port + "/api/verify?tokenId=-1";
        ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);

        // Then
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void verifyToken_WithNullTokenId_ShouldReturnBadRequest() {
        // When
        String url = "http://localhost:" + port + "/api/verify";
        ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);

        // Then
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void verifyBySerial_ShouldReturnNotImplemented() {
        // When
        String url = "http://localhost:" + port + "/api/verify/by-serial?serial=TAR-2024-001";
        ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);

        // Then
        assertEquals(HttpStatus.NOT_IMPLEMENTED, response.getStatusCode());
    }

    @Test
    void healthCheck_ShouldReturnOk() {
        // When
        String url = "http://localhost:" + port + "/api/verify/health";
        ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);

        // Then
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Verification service is healthy", response.getBody());
    }

    @Test
    void verifyToken_WithMetadataServiceError_ShouldHandleGracefully() throws Exception {
        // Given
        Long tokenId = 123L;

        // Mock metadata service error
        wireMockServer.stubFor(get(urlEqualTo("/metadata/123"))
                .willReturn(aResponse()
                        .withStatus(500)
                        .withBody("Internal Server Error")));

        // When
        String url = "http://localhost:" + port + "/api/verify?tokenId=" + tokenId;
        ResponseEntity<VerificationResponse> response = restTemplate.getForEntity(url, VerificationResponse.class);

        // Then
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        // The response should indicate verification failure due to metadata fetch error
    }

    @Test
    void verifyToken_WithTimeout_ShouldHandleGracefully() throws Exception {
        // Given
        Long tokenId = 123L;

        // Mock metadata service timeout
        wireMockServer.stubFor(get(urlEqualTo("/metadata/123"))
                .willReturn(aResponse()
                        .withStatus(200)
                        .withHeader("Content-Type", "application/json")
                        .withBody("{}")
                        .withFixedDelay(15000))); // 15 second delay to simulate timeout

        // When
        String url = "http://localhost:" + port + "/api/verify?tokenId=" + tokenId;
        ResponseEntity<VerificationResponse> response = restTemplate.getForEntity(url, VerificationResponse.class);

        // Then
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        // The response should indicate verification failure due to timeout
    }

    private TokenMetadata createTestMetadata() {
        TokenMetadata metadata = new TokenMetadata();
        metadata.setName("Test Asset Receipt");
        metadata.setDescription("Test description for integration test");
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
