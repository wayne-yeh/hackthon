# TAR Verification Service

Tokenized Asset Receipt (TAR) Verification Service - A microservice for verifying NFT tokens by comparing metadata hashes with on-chain stored hashes.

## Overview

The Verification Service provides public endpoints for QR code verification of TAR tokens. It fetches token metadata, calculates its hash, and compares it with the hash stored on the blockchain to ensure data integrity.

## Features

- **Token Verification**: Verify tokens by ID with comprehensive validation
- **Hash Comparison**: SHA-256 hash verification of metadata against on-chain storage
- **Revocation Check**: Verify if tokens have been revoked
- **Metadata Fetching**: Retrieve and validate token metadata from external services
- **RESTful API**: Clean REST endpoints with OpenAPI documentation
- **Health Monitoring**: Built-in health checks and metrics

## API Endpoints

### Verification Endpoints

- `GET /api/verify?tokenId={id}` - Verify token by ID
- `GET /api/verify/by-serial?serial={serial}` - Verify token by serial number (not implemented)
- `GET /api/verify/health` - Health check endpoint

### Documentation

- `GET /swagger-ui.html` - Swagger UI documentation
- `GET /v3/api-docs` - OpenAPI JSON specification

## Quick Start

### Prerequisites

- Java 17+
- Maven 3.6+
- Docker (optional)
- Access to blockchain RPC endpoint
- Metadata service running

### Local Development

1. **Clone and setup**:

   ```bash
   cd "4.Verification Service"
   cp env.sample .env
   # Edit .env with your configuration
   ```

2. **Run tests**:

   ```bash
   make test
   ```

3. **Start the service**:

   ```bash
   make run
   ```

4. **Access the service**:
   - API: http://localhost:8082
   - Swagger UI: http://localhost:8082/swagger-ui.html
   - Health Check: http://localhost:8082/api/verify/health

### Docker Deployment

1. **Build and run**:

   ```bash
   make docker-build
   make docker-run
   ```

2. **Using docker-compose**:
   ```bash
   make docker-compose-up
   ```

## Configuration

### Environment Variables

| Variable               | Description             | Default                                      |
| ---------------------- | ----------------------- | -------------------------------------------- |
| `BLOCKCHAIN_RPC_URL`   | Blockchain RPC endpoint | `http://localhost:8545`                      |
| `CONTRACT_ADDRESS`     | TAR contract address    | `0x5FbDB2315678afecb367f032d93F642f64180aa3` |
| `NETWORK_ID`           | Blockchain network ID   | `31337`                                      |
| `METADATA_SERVICE_URL` | Metadata service URL    | `http://localhost:8081`                      |
| `SERVER_PORT`          | Server port             | `8082`                                       |

### Application Properties

The service uses Spring Boot configuration with the following key settings:

- **Server Port**: 8082 (configurable)
- **Cache**: Caffeine with 5-minute TTL
- **Timeout**: 10 seconds for external calls
- **Logging**: Structured logging with file output

## API Usage Examples

### Verify Token by ID

```bash
curl "http://localhost:8082/api/verify?tokenId=123"
```

Response:

```json
{
  "valid": true,
  "reasons": [],
  "owner": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
  "tokenURI": "https://api.example.com/metadata/123",
  "revoked": false,
  "tokenId": 123
}
```

### Verify Revoked Token

```bash
curl "http://localhost:8082/api/verify?tokenId=456"
```

Response:

```json
{
  "valid": false,
  "reasons": ["Token is revoked"],
  "owner": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
  "tokenURI": "https://api.example.com/metadata/456",
  "revoked": true,
  "tokenId": 456
}
```

### Verify Token with Hash Mismatch

```bash
curl "http://localhost:8082/api/verify?tokenId=789"
```

Response:

```json
{
  "valid": false,
  "reasons": ["Metadata hash mismatch"],
  "owner": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
  "tokenURI": "https://api.example.com/metadata/789",
  "revoked": false,
  "tokenId": 789
}
```

## Architecture

### Components

1. **VerificationController**: REST API endpoints
2. **VerificationService**: Main business logic
3. **BlockchainClient**: Smart contract interactions
4. **MetadataClient**: External metadata fetching
5. **HashComparatorService**: Hash calculation and comparison

### Verification Flow

1. Receive token ID from client
2. Fetch token information from blockchain (owner, URI, stored hash, revocation status)
3. Fetch metadata from the token URI
4. Calculate SHA-256 hash of metadata JSON
5. Compare calculated hash with stored hash
6. Check revocation status
7. Return comprehensive verification result

### Error Handling

The service handles various error scenarios:

- **Invalid Token ID**: Returns 400 Bad Request
- **Token Not Found**: Returns verification failure with reason
- **Metadata Fetch Error**: Returns verification failure with error details
- **Blockchain Connection Error**: Returns 500 Internal Server Error
- **Timeout**: Returns verification failure with timeout reason

## Testing

### Test Structure

- **Unit Tests**: Test individual components in isolation
- **Integration Tests**: Test component interactions with mocked external services
- **WireMock**: Mock external HTTP services for testing

### Running Tests

```bash
# Run all tests
make test

# Run with coverage
make test-coverage

# Run specific test class
mvn test -Dtest=VerificationServiceTest

# Run integration tests only
mvn test -Dtest=*IntegrationTest
```

### Test Coverage

The service maintains high test coverage:

- Unit tests for all services and clients
- Integration tests with mocked external dependencies
- Negative test cases for error scenarios
- Edge case testing for boundary conditions

## Monitoring and Logging

### Health Checks

- **Endpoint**: `/api/verify/health`
- **Actuator**: `/actuator/health`
- **Metrics**: `/actuator/metrics`

### Logging

- **File**: `logs/verification-service.log`
- **Console**: Structured JSON logging
- **Levels**: Configurable per package

### Metrics

- Request count and duration
- Verification success/failure rates
- External service response times
- Cache hit/miss ratios

## Development

### Code Style

- Follow Spring Boot conventions
- Use meaningful variable and method names
- Comprehensive JavaDoc for public APIs
- Consistent error handling patterns

### Dependencies

- **Spring Boot 3.2.0**: Framework
- **Web3j 4.9.8**: Blockchain integration
- **WebFlux**: Reactive HTTP client
- **OpenAPI**: API documentation
- **WireMock**: Testing framework

## Troubleshooting

### Common Issues

1. **Blockchain Connection Failed**

   - Check RPC URL and network connectivity
   - Verify contract address is correct
   - Ensure blockchain node is running

2. **Metadata Fetch Timeout**

   - Check metadata service availability
   - Verify network connectivity
   - Consider increasing timeout settings

3. **Hash Mismatch**
   - Verify metadata service returns consistent JSON
   - Check for JSON serialization differences
   - Ensure metadata hasn't been tampered with

### Debug Mode

Enable debug logging:

```yaml
logging:
  level:
    com.tar.verification: DEBUG
```

## Contributing

1. Follow TDD approach - write tests first
2. Ensure all tests pass
3. Maintain code coverage above 80%
4. Update documentation for API changes
5. Follow semantic versioning

## License

This project is part of the TAR (Tokenized Asset Receipt) system for the hackathon.
