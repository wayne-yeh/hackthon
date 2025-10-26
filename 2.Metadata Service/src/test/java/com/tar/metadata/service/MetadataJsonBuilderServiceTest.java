package com.tar.metadata.service;

import com.tar.metadata.dto.MetadataJson;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for MetadataJsonBuilderService
 */
class MetadataJsonBuilderServiceTest {

    private MetadataJsonBuilderService metadataJsonBuilderService;

    @BeforeEach
    void setUp() {
        metadataJsonBuilderService = new MetadataJsonBuilderService();
    }

    @Test
    @DisplayName("Should build metadata JSON with all fields")
    void shouldBuildMetadataJsonWithAllFields() {
        // Given
        String invoiceNo = "INV-001";
        LocalDate purchaseDate = LocalDate.of(2023, 10, 24);
        BigDecimal amount = new BigDecimal("100.50");
        String itemName = "Test Item";
        String ownerAddress = "0x1234567890123456789012345678901234567890";
        String imageUrl = "http://example.com/image.jpg";

        // When
        MetadataJson metadata = metadataJsonBuilderService.buildMetadataJson(
                invoiceNo, purchaseDate, amount, itemName, ownerAddress, imageUrl);

        // Then
        assertNotNull(metadata);
        assertEquals(invoiceNo, metadata.getInvoiceNo());
        assertEquals(purchaseDate, metadata.getPurchaseDate());
        assertEquals(amount, metadata.getAmount());
        assertEquals(itemName, metadata.getItemName());
        assertEquals(ownerAddress, metadata.getOwnerAddress());
        assertEquals(imageUrl, metadata.getImageUrl());
        assertTrue(metadata.getTimestamp() > 0);
    }

    @Test
    @DisplayName("Should build metadata JSON with null image URL")
    void shouldBuildMetadataJsonWithNullImageUrl() {
        // Given
        String invoiceNo = "INV-002";
        LocalDate purchaseDate = LocalDate.of(2023, 10, 24);
        BigDecimal amount = new BigDecimal("200.00");
        String itemName = "Test Item 2";
        String ownerAddress = "0x1234567890123456789012345678901234567890";

        // When
        MetadataJson metadata = metadataJsonBuilderService.buildMetadataJson(
                invoiceNo, purchaseDate, amount, itemName, ownerAddress, null);

        // Then
        assertNotNull(metadata);
        assertEquals(invoiceNo, metadata.getInvoiceNo());
        assertEquals(purchaseDate, metadata.getPurchaseDate());
        assertEquals(amount, metadata.getAmount());
        assertEquals(itemName, metadata.getItemName());
        assertEquals(ownerAddress, metadata.getOwnerAddress());
        assertNull(metadata.getImageUrl());
        assertTrue(metadata.getTimestamp() > 0);
    }

    @Test
    @DisplayName("Should convert metadata to JSON string")
    void shouldConvertMetadataToJsonString() throws Exception {
        // Given
        MetadataJson metadata = metadataJsonBuilderService.buildMetadataJson(
                "INV-003", LocalDate.of(2023, 10, 24), new BigDecimal("300.00"),
                "Test Item 3", "0x1234567890123456789012345678901234567890", null);

        // When
        String jsonString = metadataJsonBuilderService.toJsonString(metadata);

        // Then
        assertNotNull(jsonString);
        assertTrue(jsonString.contains("INV-003"));
        assertTrue(jsonString.contains("Test Item 3"));
        assertTrue(jsonString.contains("300.00"));
    }

    @Test
    @DisplayName("Should parse JSON string to metadata")
    void shouldParseJsonStringToMetadata() throws Exception {
        // Given
        String jsonString = """
                {
                    "invoiceNo": "INV-004",
                    "purchaseDate": "2023-10-24",
                    "amount": 400.00,
                    "itemName": "Test Item 4",
                    "ownerAddress": "0x1234567890123456789012345678901234567890",
                    "imageUrl": "http://example.com/image4.jpg",
                    "timestamp": 1698163200000
                }
                """;

        // When
        MetadataJson metadata = metadataJsonBuilderService.fromJsonString(jsonString);

        // Then
        assertNotNull(metadata);
        assertEquals("INV-004", metadata.getInvoiceNo());
        assertEquals(LocalDate.of(2023, 10, 24), metadata.getPurchaseDate());
        assertEquals(new BigDecimal("400.00"), metadata.getAmount());
        assertEquals("Test Item 4", metadata.getItemName());
        assertEquals("0x1234567890123456789012345678901234567890", metadata.getOwnerAddress());
        assertEquals("http://example.com/image4.jpg", metadata.getImageUrl());
        assertEquals(1698163200000L, metadata.getTimestamp());
    }

    @Test
    @DisplayName("Should handle round-trip conversion")
    void shouldHandleRoundTripConversion() throws Exception {
        // Given
        MetadataJson originalMetadata = metadataJsonBuilderService.buildMetadataJson(
                "INV-005", LocalDate.of(2023, 10, 24), new BigDecimal("500.00"),
                "Test Item 5", "0x1234567890123456789012345678901234567890", "http://example.com/image5.jpg");

        // When
        String jsonString = metadataJsonBuilderService.toJsonString(originalMetadata);
        MetadataJson parsedMetadata = metadataJsonBuilderService.fromJsonString(jsonString);

        // Then
        assertEquals(originalMetadata.getInvoiceNo(), parsedMetadata.getInvoiceNo());
        assertEquals(originalMetadata.getPurchaseDate(), parsedMetadata.getPurchaseDate());
        assertEquals(originalMetadata.getAmount(), parsedMetadata.getAmount());
        assertEquals(originalMetadata.getItemName(), parsedMetadata.getItemName());
        assertEquals(originalMetadata.getOwnerAddress(), parsedMetadata.getOwnerAddress());
        assertEquals(originalMetadata.getImageUrl(), parsedMetadata.getImageUrl());
        assertEquals(originalMetadata.getTimestamp(), parsedMetadata.getTimestamp());
    }
}
