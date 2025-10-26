package com.tar.metadata.config;

import com.tar.metadata.adapter.IpfsAdapterStub;
import com.tar.metadata.adapter.S3Adapter;
import com.tar.metadata.adapter.StorageAdapter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

/**
 * Configuration for storage adapters
 */
@Configuration
public class StorageConfig {

    @Value("${app.storage.type:s3}")
    private String storageType;

    @Bean
    @Primary
    public StorageAdapter storageAdapter(IpfsAdapterStub ipfsAdapterStub) {
        return ipfsAdapterStub;
    }

    @Bean
    @ConditionalOnProperty(name = "app.storage.type", havingValue = "s3")
    public StorageAdapter s3StorageAdapter(S3Adapter s3Adapter) {
        return s3Adapter;
    }
}
