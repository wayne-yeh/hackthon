package com.tar.metadata.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.tar.metadata.dto.MetadataJson;
import org.springframework.stereotype.Service;

import java.time.Instant;

/**
 * Service for building metadata JSON
 */
@Service
public class MetadataJsonBuilderService {

    private final ObjectMapper objectMapper;

    public MetadataJsonBuilderService() {
        this.objectMapper = new ObjectMapper();
        this.objectMapper.registerModule(new JavaTimeModule());
    }

    /**
     * Build metadata JSON from receipt data
     * 
     * @param invoiceNo    invoice number
     * @param purchaseDate purchase date
     * @param amount       amount
     * @param itemName     item name
     * @param ownerAddress owner address
     * @param imageUrl     image URL (optional)
     * @return MetadataJson object
     */
    public MetadataJson buildMetadataJson(String invoiceNo, java.time.LocalDate purchaseDate,
            java.math.BigDecimal amount, String itemName,
            String ownerAddress, String imageUrl) {

        MetadataJson metadata = new MetadataJson();
        metadata.setInvoiceNo(invoiceNo);
        metadata.setPurchaseDate(purchaseDate);
        metadata.setAmount(amount);
        metadata.setItemName(itemName);
        metadata.setOwnerAddress(ownerAddress);
        metadata.setImageUrl(imageUrl);
        metadata.setTimestamp(Instant.now().toEpochMilli());

        // Set ERC721 standard fields for NFT compatibility
        metadata.setName("TAR Receipt #" + invoiceNo);
        metadata.setDescription(
                String.format("Tokenized Asset Receipt - %s (Amount: %s TWD, Date: %s)",
                        itemName, amount.toString(), purchaseDate.toString()));
        metadata.setImage(imageUrl); // ERC721 standard image field

        return metadata;
    }

    /**
     * Convert MetadataJson to JSON string
     * 
     * @param metadata the metadata object
     * @return JSON string
     * @throws Exception if conversion fails
     */
    public String toJsonString(MetadataJson metadata) throws Exception {
        return objectMapper.writeValueAsString(metadata);
    }

    /**
     * Parse JSON string to MetadataJson
     * 
     * @param jsonString the JSON string
     * @return MetadataJson object
     * @throws Exception if parsing fails
     */
    public MetadataJson fromJsonString(String jsonString) throws Exception {
        return objectMapper.readValue(jsonString, MetadataJson.class);
    }
}
