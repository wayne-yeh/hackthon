package com.tar.verification.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;

/**
 * Response DTO for token verification
 */
@Schema(description = "Token verification response")
public class VerificationResponse {

    @JsonProperty("valid")
    @Schema(description = "Whether the token is valid", example = "true")
    private boolean valid;

    @JsonProperty("reasons")
    @Schema(description = "List of verification failure reasons", example = "[\"Token not found\", \"Hash mismatch\"]")
    private List<String> reasons;

    @JsonProperty("owner")
    @Schema(description = "Token owner address", example = "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6")
    private String owner;

    @JsonProperty("tokenURI")
    @Schema(description = "Token metadata URI", example = "https://api.example.com/metadata/123")
    private String tokenURI;

    @JsonProperty("revoked")
    @Schema(description = "Whether the token is revoked", example = "false")
    private boolean revoked;

    @JsonProperty("tokenId")
    @Schema(description = "Token ID", example = "123")
    private Long tokenId;

    // Constructors
    public VerificationResponse() {
    }

    public VerificationResponse(boolean valid, List<String> reasons, String owner,
            String tokenURI, boolean revoked, Long tokenId) {
        this.valid = valid;
        this.reasons = reasons;
        this.owner = owner;
        this.tokenURI = tokenURI;
        this.revoked = revoked;
        this.tokenId = tokenId;
    }

    // Builder pattern
    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private boolean valid;
        private List<String> reasons;
        private String owner;
        private String tokenURI;
        private boolean revoked;
        private Long tokenId;

        public Builder valid(boolean valid) {
            this.valid = valid;
            return this;
        }

        public Builder reasons(List<String> reasons) {
            this.reasons = reasons;
            return this;
        }

        public Builder owner(String owner) {
            this.owner = owner;
            return this;
        }

        public Builder tokenURI(String tokenURI) {
            this.tokenURI = tokenURI;
            return this;
        }

        public Builder revoked(boolean revoked) {
            this.revoked = revoked;
            return this;
        }

        public Builder tokenId(Long tokenId) {
            this.tokenId = tokenId;
            return this;
        }

        public VerificationResponse build() {
            return new VerificationResponse(valid, reasons, owner, tokenURI, revoked, tokenId);
        }
    }

    // Getters and Setters
    public boolean isValid() {
        return valid;
    }

    public void setValid(boolean valid) {
        this.valid = valid;
    }

    public List<String> getReasons() {
        return reasons;
    }

    public void setReasons(List<String> reasons) {
        this.reasons = reasons;
    }

    public String getOwner() {
        return owner;
    }

    public void setOwner(String owner) {
        this.owner = owner;
    }

    public String getTokenURI() {
        return tokenURI;
    }

    public void setTokenURI(String tokenURI) {
        this.tokenURI = tokenURI;
    }

    public boolean isRevoked() {
        return revoked;
    }

    public void setRevoked(boolean revoked) {
        this.revoked = revoked;
    }

    public Long getTokenId() {
        return tokenId;
    }

    public void setTokenId(Long tokenId) {
        this.tokenId = tokenId;
    }

    @Override
    public String toString() {
        return "VerificationResponse{" +
                "valid=" + valid +
                ", reasons=" + reasons +
                ", owner='" + owner + '\'' +
                ", tokenURI='" + tokenURI + '\'' +
                ", revoked=" + revoked +
                ", tokenId=" + tokenId +
                '}';
    }
}
