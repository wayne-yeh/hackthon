package com.tar.verification.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;

/**
 * DTO for token metadata information
 */
@Schema(description = "Token metadata information")
public class TokenMetadata {

    @JsonProperty("name")
    @Schema(description = "Token name", example = "Asset Receipt #123")
    private String name;

    @JsonProperty("description")
    @Schema(description = "Token description", example = "Tokenized Asset Receipt for property XYZ")
    private String description;

    @JsonProperty("image")
    @Schema(description = "Token image URL", example = "https://example.com/image.png")
    private String image;

    @JsonProperty("attributes")
    @Schema(description = "Token attributes")
    private Object attributes;

    @JsonProperty("serialNumber")
    @Schema(description = "Serial number", example = "TAR-2024-001")
    private String serialNumber;

    @JsonProperty("issuer")
    @Schema(description = "Issuer information")
    private String issuer;

    @JsonProperty("issueDate")
    @Schema(description = "Issue date", example = "2024-01-01")
    private String issueDate;

    // Constructors
    public TokenMetadata() {
    }

    public TokenMetadata(String name, String description, String image, Object attributes,
            String serialNumber, String issuer, String issueDate) {
        this.name = name;
        this.description = description;
        this.image = image;
        this.attributes = attributes;
        this.serialNumber = serialNumber;
        this.issuer = issuer;
        this.issueDate = issueDate;
    }

    // Getters and Setters
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }

    public Object getAttributes() {
        return attributes;
    }

    public void setAttributes(Object attributes) {
        this.attributes = attributes;
    }

    public String getSerialNumber() {
        return serialNumber;
    }

    public void setSerialNumber(String serialNumber) {
        this.serialNumber = serialNumber;
    }

    public String getIssuer() {
        return issuer;
    }

    public void setIssuer(String issuer) {
        this.issuer = issuer;
    }

    public String getIssueDate() {
        return issueDate;
    }

    public void setIssueDate(String issueDate) {
        this.issueDate = issueDate;
    }

    @Override
    public String toString() {
        return "TokenMetadata{" +
                "name='" + name + '\'' +
                ", description='" + description + '\'' +
                ", image='" + image + '\'' +
                ", attributes=" + attributes +
                ", serialNumber='" + serialNumber + '\'' +
                ", issuer='" + issuer + '\'' +
                ", issueDate='" + issueDate + '\'' +
                '}';
    }
}
