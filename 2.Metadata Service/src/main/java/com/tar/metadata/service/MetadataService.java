package com.tar.metadata.service;

import com.tar.metadata.adapter.StorageAdapter;
import com.tar.metadata.dto.MetadataJson;
import com.tar.metadata.dto.ReceiptUploadRequest;
import com.tar.metadata.dto.ReceiptUploadResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

/**
 * Main service for metadata operations
 */
@Service
public class MetadataService {

    private final StorageAdapter storageAdapter;
    private final HashCalculatorService hashCalculatorService;
    private final MetadataJsonBuilderService metadataJsonBuilderService;

    @Value("${app.metadata.base-url:http://localhost:8081}")
    private String baseUrl;

    @Autowired
    public MetadataService(StorageAdapter storageAdapter,
            HashCalculatorService hashCalculatorService,
            MetadataJsonBuilderService metadataJsonBuilderService) {
        this.storageAdapter = storageAdapter;
        this.hashCalculatorService = hashCalculatorService;
        this.metadataJsonBuilderService = metadataJsonBuilderService;
    }

    /**
     * Upload receipt metadata
     * 
     * @param request the upload request
     * @return upload response with metadata URL and hash
     * @throws Exception if upload fails
     */
    public ReceiptUploadResponse uploadReceipt(ReceiptUploadRequest request) throws Exception {
        // Generate unique filename
        String filename = generateFilename(request.getInvoiceNo());

        // Upload image if provided
        String imageUrl = null;
        if (request.getImage() != null && !request.getImage().isEmpty()) {
            String imageFilename = generateImageFilename(request.getImage());
            imageUrl = storageAdapter.uploadFile(request.getImage(), imageFilename);
        } else if (request.getImageBase64() != null && !request.getImageBase64().isEmpty()) {
            // Check if imageBase64 is actually a URL (starts with http:// or https://)
            String imageBase64Value = request.getImageBase64().trim();
            if (imageBase64Value.startsWith("http://") || imageBase64Value.startsWith("https://")) {
                // It's a URL, use it directly
                imageUrl = imageBase64Value;
            } else {
                // It's a base64 string, try to decode and upload
                MultipartFile multipartFile = base64ToMultipartFile(imageBase64Value);
                if (multipartFile != null) {
                    String imageFilename = generateImageFilename(multipartFile);
                    imageUrl = storageAdapter.uploadFile(multipartFile, imageFilename);
                }
            }
        }

        // Build metadata JSON
        MetadataJson metadata = metadataJsonBuilderService.buildMetadataJson(
                request.getInvoiceNo(),
                request.getPurchaseDate(),
                request.getAmount(),
                request.getItemName(),
                request.getOwnerAddress(),
                imageUrl);

        // Convert to JSON string
        String metadataJson = metadataJsonBuilderService.toJsonString(metadata);

        // Calculate hash
        String metaHash = hashCalculatorService.calculateSha256(metadataJson);

        // Upload metadata JSON
        String metadataUrl = storageAdapter.uploadMetadata(metadataJson, filename);

        return new ReceiptUploadResponse(metadataUrl, metaHash);
    }

    /**
     * Get metadata hash from URL
     * 
     * @param url the metadata URL
     * @return SHA-256 hash
     * @throws Exception if retrieval fails
     */
    public String getMetadataHash(String url) throws Exception {
        if (url == null || url.trim().isEmpty()) {
            throw new IllegalArgumentException("URL cannot be null or empty");
        }

        // Download metadata from URL
        String metadataJson = storageAdapter.downloadMetadata(url);

        // Calculate hash
        return hashCalculatorService.calculateSha256(metadataJson);
    }

    /**
     * Download metadata from URL
     * 
     * @param url the metadata URL
     * @return metadata JSON string
     * @throws Exception if download fails
     */
    public String downloadMetadata(String url) throws Exception {
        if (url == null || url.trim().isEmpty()) {
            throw new IllegalArgumentException("URL cannot be null or empty");
        }

        return storageAdapter.downloadMetadata(url);
    }

    /**
     * Generate unique filename for metadata
     * 
     * @param invoiceNo invoice number
     * @return unique filename
     */
    private String generateFilename(String invoiceNo) {
        String sanitizedInvoiceNo = invoiceNo.replaceAll("[^a-zA-Z0-9]", "_");
        return String.format("metadata_%s_%s.json", sanitizedInvoiceNo, UUID.randomUUID().toString());
    }

    /**
     * Generate filename for image
     * 
     * @param image the image file
     * @return filename with original extension
     */
    private String generateImageFilename(MultipartFile image) {
        String originalFilename = image.getOriginalFilename();
        String extension = ".png"; // Default extension for base64 images

        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }

        return String.format("image_%s%s", UUID.randomUUID().toString(), extension);
    }

    /**
     * Convert base64 string to MultipartFile
     * 
     * @param base64String base64 encoded image string
     * @return MultipartFile or null if conversion fails
     */
    private MultipartFile base64ToMultipartFile(String base64String) {
        try {
            // Decode base64 string
            byte[] imageBytes = java.util.Base64.getDecoder().decode(base64String);

            // Create a simple MultipartFile implementation
            return new MultipartFile() {
                @Override
                public String getName() {
                    return "image";
                }

                @Override
                public String getOriginalFilename() {
                    return "image.png";
                }

                @Override
                public String getContentType() {
                    return "image/png";
                }

                @Override
                public boolean isEmpty() {
                    return imageBytes.length == 0;
                }

                @Override
                public long getSize() {
                    return imageBytes.length;
                }

                @Override
                public byte[] getBytes() {
                    return imageBytes;
                }

                @Override
                public java.io.InputStream getInputStream() {
                    return new java.io.ByteArrayInputStream(imageBytes);
                }

                @Override
                public void transferTo(java.io.File dest) throws java.io.IOException, IllegalStateException {
                    java.nio.file.Files.write(dest.toPath(), imageBytes);
                }
            };
        } catch (Exception e) {
            return null;
        }
    }
}
