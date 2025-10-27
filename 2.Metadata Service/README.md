# Tokenized Asset Receipt (TAR) Metadata Service

A Spring Boot 3 microservice for managing metadata of tokenized asset receipts using NFTs. This service handles metadata storage, hash calculation, and verification for the TAR system.

## Features

- **Metadata Management**: Upload and store receipt metadata with optional image files
- **Hash Verification**: Calculate and verify SHA-256 hashes for metadata integrity
- **Pluggable Storage**: Support for S3 (AWS/LocalStack) and IPFS (stub implementation)
- **REST API**: OpenAPI/Swagger documentation
- **Test Coverage**: Comprehensive unit and integration tests with Testcontainers
- **Docker Support**: Containerized deployment with Docker Compose

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Controller    │    │    Service      │    │   Adapter       │
│                 │    │                 │    │                 │
│ MetadataController│──▶│ MetadataService │──▶│ StorageAdapter  │
│                 │    │                 │    │                 │
│ - POST /receipts│    │ - uploadReceipt │    │ - S3Adapter     │
│ - GET /hash     │    │ - getMetadataHash│   │ - IpfsAdapterStub│
│ - GET /download │    │ - downloadMetadata│  │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Quick Start

### Prerequisites

- Java 17+
- Maven 3.6+
- Docker & Docker Compose (for containerized deployment)

### Local Development

1. **Clone and setup**:

   ```bash
   cd "2.Metadata Service"
   cp env.sample .env
   ```

2. **Run tests**:

   ```bash
   make test
   ```

3. **Start with Docker Compose**:

   ```bash
   make docker-run
   ```

4. **Access the service**:
   - API: http://localhost:8081/api/metadata
   - Swagger UI: http://localhost:8081/swagger-ui.html
   - Health Check: http://localhost:8081/actuator/health

### Manual Setup

1. **Start LocalStack** (for S3):

   ```bash
   docker run -d -p 4566:4566 localstack/localstack
   ```

2. **Run the application**:
   ```bash
   make run
   ```

## API Endpoints

### Upload Receipt Metadata

```http
POST /api/metadata/receipts
Content-Type: multipart/form-data

Parameters:
- invoiceNo: string (required)
- purchaseDate: string (yyyy-MM-dd, required)
- amount: string (required)
- itemName: string (required)
- ownerAddress: string (Ethereum address, required)
- image: file (optional)

Response:
{
  "metadataUrl": "http://localhost:8081/api/metadata/download?key=metadata/...",
  "metaHash": "a1b2c3d4e5f6..."
}
```

### Get Metadata Hash

```http
GET /api/metadata/hash?url=<metadata_url>

Response:
{
  "metaHash": "a1b2c3d4e5f6..."
}
```

### Download File

```http
GET /api/metadata/download?key=<file_key>

Response: File content or JSON metadata
```

## Configuration

### Environment Variables

| Variable                | Description                   | Default                 |
| ----------------------- | ----------------------------- | ----------------------- |
| `AWS_S3_BUCKET_NAME`    | S3 bucket name                | `tar-metadata`          |
| `AWS_S3_REGION`         | AWS region                    | `us-east-1`             |
| `AWS_S3_ENDPOINT`       | S3 endpoint (LocalStack)      | `http://localhost:4566` |
| `AWS_S3_ACCESS_KEY`     | AWS access key                | `test`                  |
| `AWS_S3_SECRET_KEY`     | AWS secret key                | `test`                  |
| `APP_STORAGE_TYPE`      | Storage type (`s3` or `ipfs`) | `s3`                    |
| `APP_METADATA_BASE_URL` | Base URL for metadata         | `http://localhost:8081` |
| `SERVER_PORT`           | Server port                   | `8081`                  |

### Storage Types

#### S3 Storage (Default)

- Uses AWS S3 or LocalStack for storage
- Configured via `aws.s3.*` properties
- Supports both metadata JSON and image files

#### IPFS Storage (Stub)

- In-memory implementation for development
- TODO: Implement actual IPFS integration
- Configured via `app.storage.type=ipfs`

## Testing

### Unit Tests

```bash
make test
```

### Integration Tests

```bash
make test-integration
```

### Test Coverage

```bash
make test-coverage
```

### Test Structure

- **Unit Tests**: Test individual components in isolation
- **Integration Tests**: Test service interactions with Testcontainers
- **S3 Tests**: Test S3 integration with LocalStack
- **IPFS Tests**: Test IPFS stub implementation

## Development

### Project Structure

```
src/
├── main/java/com/tar/metadata/
│   ├── controller/          # REST controllers
│   ├── service/            # Business logic
│   ├── adapter/            # Storage adapters
│   ├── config/             # Configuration
│   └── dto/                # Data transfer objects
└── test/java/com/tar/metadata/
    ├── controller/         # Controller tests
    ├── service/           # Service tests
    ├── adapter/           # Adapter tests
    └── *IntegrationTest.java # Integration tests
```

### Adding New Storage Adapter

1. Implement `StorageAdapter` interface
2. Add configuration in `StorageConfig`
3. Write tests for the new adapter
4. Update documentation

### Code Quality

```bash
make check  # Run checkstyle
make clean  # Clean build artifacts
```

## Deployment

### Docker

```bash
make docker-build
make docker-run
```

### Production Considerations

1. **Security**: Configure proper AWS credentials
2. **Monitoring**: Enable actuator endpoints
3. **Logging**: Configure log levels and outputs
4. **Scaling**: Use load balancer for multiple instances

## Integration with TAR System

This service integrates with:

- **Smart Contract Service**: Provides metadata URLs and hashes for NFT minting
- **Backend Core API**: Receives receipt data and returns metadata
- **Verification Service**: Validates metadata hashes against blockchain

## Troubleshooting

### Common Issues

1. **LocalStack Connection Failed**:

   - Ensure LocalStack is running on port 4566
   - Check Docker network connectivity

2. **S3 Bucket Not Found**:

   - Service automatically creates bucket
   - Check AWS credentials and permissions

3. **Test Failures**:
   - Ensure Docker is running for Testcontainers
   - Check available ports (8081, 4566)

### Logs

```bash
# View application logs
docker-compose logs metadata-service

# View LocalStack logs
docker-compose logs localstack
```

## License

MIT License - see LICENSE file for details.


