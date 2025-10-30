package com.tar.metadata.adapter;

import org.springframework.web.multipart.MultipartFile;

/**
 * Interface for storage adapters
 */
public interface StorageAdapter {

    /**
     * Upload metadata JSON to storage
     * 
     * @param metadataJson the metadata JSON string
     * @param filename     the filename
     * @return the URL of the uploaded metadata
     * @throws Exception if upload fails
     */
    String uploadMetadata(String metadataJson, String filename) throws Exception;

    /**
     * Upload file to storage
     * 
     * @param file     the file to upload
     * @param filename the filename
     * @return the URL of the uploaded file
     * @throws Exception if upload fails
     */
    String uploadFile(MultipartFile file, String filename) throws Exception;

    /**
     * Download metadata from URL
     * 
     * @param url the metadata URL
     * @return the metadata JSON string
     * @throws Exception if download fails
     */
    String downloadMetadata(String url) throws Exception;
}


