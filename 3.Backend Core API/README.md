# TAR Backend Core API

Backend Core API for the Tokenized Asset Receipt (TAR) system. This service orchestrates the complete receipt lifecycle: metadata upload, NFT minting on blockchain, and verification.

## Features

- 🔐 **Secure API Key Authentication**: API key-based authentication for issuer operations
- 📝 **Receipt Issuance**: Upload receipt data, create metadata, and mint NFT in one operation
- ✅ **Receipt Verification**: Verify receipts against blockchain and metadata hash
- 🚫 **Receipt Revocation**: Revoke receipts with on-chain enforcement
- 📊 **Owner Queries**: Retrieve all receipts for a specific owner address
- 🔍 **OpenAPI Documentation**: Interactive API documentation with Swagger UI
- 🧪 **Comprehensive Testing**: Unit tests, integration tests, and test coverage reports

## Tech Stack

- **Java 17**
- **Spring Boot 3.2.0**
- **Spring Data JPA** with PostgreSQL
- **Spring Security** for API authentication
- **web3j** for Ethereum blockchain integration
- **SpringDoc OpenAPI** for API documentation
- **JUnit 5** + **Mockito** for testing
- **Testcontainers** for integration testing
- **Docker** for containerization

## Architecture

```
┌─────────────┐         ┌──────────────────┐         ┌───────────────┐
│   Frontend  │────────▶│  Backend Core    │────────▶│   Metadata    │
│    DApp     │         │      API         │         │   Service     │
└─────────────┘         └──────────────────┘         └───────────────┘
                               │
                               │ web3j
                               ▼
                        ┌──────────────┐
                        │  Blockchain  │
                        │ (EVM/Sepolia)│
                        └──────────────┘
                               │
                               ▼
                        ┌──────────────┐
                        │  PostgreSQL  │
                        │   Database   │
                        └──────────────┘
```

## Prerequisites

- Java 17 or higher
- Maven 3.6+ (or use included Maven Wrapper)
- Docker & Docker Compose (for containerized deployment)
- PostgreSQL 14+ (for local development)
- Access to Ethereum node (Hardhat, Sepolia, etc.)
- Running Metadata Service

## Quick Start

### 1. Clone and Setup

```bash
# Navigate to project directory
cd "3.Backend Core API"

# Copy environment template
cp .env.sample .env

# Edit .env with your configuration
nano .env
```

### 2. Configure Environment

Edit `.env` file:

```env
# Database Configuration
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=tar_backend
POSTGRES_USER=taruser
POSTGRES_PASSWORD=your-secure-password

# Blockchain Configuration
BLOCKCHAIN_RPC_URL=http://localhost:8545
CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
ISSUER_PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

# Metadata Service Configuration
METADATA_SERVICE_URL=http://localhost:8081

# Security Configuration
API_KEY_SECRET=change-this-in-production
```

### 3. Run with Docker (Recommended)

```bash
# Build and start all services
make docker-up

# View logs
make docker-logs

# Stop services
make docker-down
```

### 4. Run Locally (Development)

```bash
# Install Maven wrapper (if needed)
make setup

# Build the application
make build

# Run tests
make test

# Start the application
make run
```

## API Endpoints

### Base URL

```
http://localhost:8080/api/v1
```

### Authentication

Protected endpoints require an API key header:

```
X-API-Key: your-api-key-secret
```

### Endpoints

#### 1. Issue Receipt (Protected)

```http
POST /api/v1/receipts/issue
Content-Type: application/json
X-API-Key: your-api-key-secret

{
  "invoiceNo": "INV-2024-001",
  "purchaseDate": "2024-01-15",
  "amount": 1000.00,
  "itemName": "MacBook Pro 16\"",
  "ownerAddress": "0x1234567890123456789012345678901234567890",
  "imageBase64": "data:image/png;base64,..."
}
```

**Response:**

```json
{
  "success": true,
  "tokenId": 1,
  "transactionHash": "0x9876...",
  "metadataUri": "https://metadata.example.com/1",
  "metadataHash": "0xabcd...",
  "ownerAddress": "0x1234...",
  "message": "Receipt issued successfully"
}
```

#### 2. Verify Receipt (Public)

```http
POST /api/v1/receipts/verify
Content-Type: application/json

{
  "tokenId": 1,
  "metadataHash": "0xabcd..."
}
```

**Response:**

```json
{
  "valid": true,
  "tokenId": 1,
  "ownerAddress": "0x1234...",
  "revoked": false,
  "metadataHash": "0xabcd...",
  "hashMatches": true,
  "message": "Receipt is valid",
  "verifiedAt": "2024-01-15T10:30:00"
}
```

#### 3. Revoke Receipt (Protected)

```http
POST /api/v1/receipts/{tokenId}/revoke
X-API-Key: your-api-key-secret
```

#### 4. Get Receipt Details (Public)

```http
GET /api/v1/receipts/{tokenId}/details
```

#### 5. Get Receipts by Owner (Protected)

```http
GET /api/v1/receipts/owner/{ownerAddress}
X-API-Key: your-api-key-secret
```

#### 6. Get Active Receipts by Owner (Protected)

```http
GET /api/v1/receipts/owner/{ownerAddress}/active
X-API-Key: your-api-key-secret
```

## Testing

### Run All Tests

```bash
make test
```

### Run with Coverage

```bash
make coverage
# View report at target/site/jacoco/index.html
```

### Test Structure

- **Unit Tests**: Service and repository layer tests with Mockito
- **Controller Tests**: REST endpoint tests with MockMvc
- **Integration Tests**: Full stack tests with H2 database

## API Documentation

### Swagger UI

Once the application is running, access interactive API documentation:

```
http://localhost:8080/swagger-ui.html
```

### OpenAPI JSON

```
http://localhost:8080/api-docs
```

## Database Schema

### TAR Receipts Table

```sql
CREATE TABLE tar_receipts (
    id BIGSERIAL PRIMARY KEY,
    token_id BIGINT NOT NULL UNIQUE,
    invoice_no VARCHAR(255) NOT NULL UNIQUE,
    purchase_date DATE NOT NULL,
    amount DECIMAL(19,2) NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    owner_address VARCHAR(42) NOT NULL,
    metadata_uri VARCHAR(512) NOT NULL,
    metadata_hash VARCHAR(66) NOT NULL,
    transaction_hash VARCHAR(66) NOT NULL,
    revoked BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL,
    revoked_at TIMESTAMP,
    INDEX idx_token_id (token_id),
    INDEX idx_owner_address (owner_address),
    INDEX idx_invoice_no (invoice_no)
);
```

## Development

### Project Structure

```
src/
├── main/
│   ├── java/com/tar/backend/
│   │   ├── BackendCoreApplication.java
│   │   ├── config/           # Configuration classes
│   │   ├── controller/       # REST controllers
│   │   ├── dto/              # Data transfer objects
│   │   ├── entity/           # JPA entities
│   │   ├── exception/        # Exception handlers
│   │   ├── repository/       # JPA repositories
│   │   └── service/          # Business logic
│   └── resources/
│       └── application.yml   # Application configuration
└── test/
    ├── java/com/tar/backend/
    │   ├── controller/       # Controller tests
    │   ├── integration/      # Integration tests
    │   ├── repository/       # Repository tests
    │   └── service/          # Service tests
    └── resources/
        └── application-test.yml
```

### Adding New Features

1. Write failing test first (TDD approach)
2. Implement the feature
3. Run tests to verify
4. Update documentation

## Deployment

### Docker Deployment

```bash
# Build image
make docker-build

# Deploy with compose
make docker-up
```

### Environment Variables

All configuration can be set via environment variables. See `.env.sample` for full list.

### Health Checks

```bash
# Application health
curl http://localhost:8080/actuator/health

# Detailed health (authenticated)
curl -u admin:password http://localhost:8080/actuator/health
```

## Troubleshooting

### Connection Issues

**Problem**: Cannot connect to PostgreSQL

```bash
# Check PostgreSQL is running
docker-compose ps postgres

# View PostgreSQL logs
docker-compose logs postgres
```

**Problem**: Cannot connect to Metadata Service

```bash
# Verify metadata service is accessible
curl http://localhost:8081/actuator/health
```

**Problem**: Blockchain connection errors

```bash
# Check blockchain node is running
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

### Testing Issues

**Problem**: Tests failing locally

```bash
# Clean and rebuild
make clean build test
```

## Security Considerations

- 🔑 **Private Keys**: Never commit private keys to version control
- 🛡️ **API Keys**: Rotate API keys regularly
- 🔒 **Database**: Use strong passwords and restrict access
- 🌐 **CORS**: Configure allowed origins in production
- 📝 **Logging**: Avoid logging sensitive data

## Performance

- **Caching**: Spring Cache enabled for frequently accessed data
- **Connection Pooling**: HikariCP for database connections
- **Async Processing**: Async operations for non-blocking I/O
- **Indexes**: Database indexes on frequently queried fields

## Monitoring

Access actuator endpoints:

- Health: `/actuator/health`
- Info: `/actuator/info`
- Metrics: `/actuator/metrics`

## Contributing

1. Follow TDD approach
2. Maintain test coverage above 80%
3. Update documentation
4. Follow Java code conventions

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:

- GitHub Issues: [Create an issue]
- Documentation: Check API_DOCUMENTATION.md
- Swagger UI: http://localhost:8080/swagger-ui.html

