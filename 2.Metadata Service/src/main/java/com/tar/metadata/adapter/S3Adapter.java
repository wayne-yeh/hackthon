package com.tar.metadata.adapter;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;

import java.io.IOException;
import java.net.URI;

/**
 * S3 storage adapter implementation
 */
@Component
@ConditionalOnProperty(name = "app.storage.type", havingValue = "s3")
public class S3Adapter implements StorageAdapter {

    private static final Logger logger = LoggerFactory.getLogger(S3Adapter.class);

    private final S3Client s3Client;
    private final String bucketName;
    private final String baseUrl;

    public S3Adapter(@Value("${aws.s3.bucket-name}") String bucketName,
            @Value("${aws.s3.region}") String region,
            @Value("${aws.s3.endpoint}") String endpoint,
            @Value("${aws.s3.access-key}") String accessKey,
            @Value("${aws.s3.secret-key}") String secretKey,
            @Value("${app.metadata.base-url:http://localhost:8081}") String baseUrl) {

        this.bucketName = bucketName;
        this.baseUrl = baseUrl;

        // Create S3 client
        AwsBasicCredentials credentials = AwsBasicCredentials.create(accessKey, secretKey);

        this.s3Client = S3Client.builder()
                .region(Region.of(region))
                .endpointOverride(URI.create(endpoint))
                .credentialsProvider(StaticCredentialsProvider.create(credentials))
                .build();

        // Ensure bucket exists
        ensureBucketExists();
    }

    @Override
    public String uploadMetadata(String metadataJson, String filename) throws Exception {
        try {
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key("metadata/" + filename)
                    .contentType("application/json")
                    .build();

            s3Client.putObject(putObjectRequest, RequestBody.fromString(metadataJson));

            String url = baseUrl + "/api/metadata/download?key=metadata/" + filename;
            logger.info("Metadata uploaded successfully: {}", url);
            return url;

        } catch (Exception e) {
            logger.error("Failed to upload metadata: {}", e.getMessage(), e);
            throw new Exception("Failed to upload metadata", e);
        }
    }

    @Override
    public String uploadFile(MultipartFile file, String filename) throws Exception {
        try {
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key("images/" + filename)
                    .contentType(file.getContentType())
                    .build();

            s3Client.putObject(putObjectRequest, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

            String url = baseUrl + "/api/metadata/download?key=images/" + filename;
            logger.info("File uploaded successfully: {}", url);
            return url;

        } catch (IOException e) {
            logger.error("Failed to upload file: {}", e.getMessage(), e);
            throw new Exception("Failed to upload file", e);
        }
    }

    @Override
    public String downloadMetadata(String url) throws Exception {
        try {
            // Extract key from URL
            String key = extractKeyFromUrl(url);

            GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .build();

            return s3Client.getObjectAsBytes(getObjectRequest).asUtf8String();

        } catch (Exception e) {
            logger.error("Failed to download metadata: {}", e.getMessage(), e);
            throw new Exception("Failed to download metadata", e);
        }
    }

    private void ensureBucketExists() {
        try {
            HeadBucketRequest headBucketRequest = HeadBucketRequest.builder()
                    .bucket(bucketName)
                    .build();

            s3Client.headBucket(headBucketRequest);
            logger.info("Bucket {} exists", bucketName);

        } catch (NoSuchBucketException e) {
            logger.info("Bucket {} does not exist, creating...", bucketName);

            CreateBucketRequest createBucketRequest = CreateBucketRequest.builder()
                    .bucket(bucketName)
                    .build();

            s3Client.createBucket(createBucketRequest);
            logger.info("Bucket {} created successfully", bucketName);
        }
    }

    private String extractKeyFromUrl(String url) {
        // Simple extraction - in production, you might want more robust parsing
        if (url.contains("key=")) {
            return url.substring(url.indexOf("key=") + 4);
        }
        throw new IllegalArgumentException("Invalid URL format: " + url);
    }
}
