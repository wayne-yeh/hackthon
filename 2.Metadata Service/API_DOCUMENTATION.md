# TAR Metadata Service API Documentation

## Overview

The TAR Metadata Service provides REST APIs for managing metadata of tokenized asset receipts. It supports uploading receipt data with optional images, calculating SHA-256 hashes for verification, and storing metadata in pluggable storage backends (S3 or IPFS).

## Base URL

```
http://localhost:8081/api/metadata
```

## Authentication

Currently no authentication is required. In production, implement proper authentication mechanisms.

## Endpoints

### 1. Upload Receipt Metadata

Upload receipt metadata with optional image file.

**Endpoint**: `POST /api/metadata/receipts`

**Content-Type**: `multipart/form-data`

**Parameters**:

| Parameter      | Type   | Required | Description                               |
| -------------- | ------ | -------- | ----------------------------------------- |
| `invoiceNo`    | string | Yes      | Invoice number                            |
| `purchaseDate` | string | Yes      | Purchase date in yyyy-MM-dd format        |
| `amount`       | string | Yes      | Purchase amount                           |
| `itemName`     | string | Yes      | Name of the purchased item                |
| `ownerAddress` | string | Yes      | Ethereum address of the owner (0x format) |
| `image`        | file   | No       | Optional image file                       |

**Example Request**:

```bash
curl -X POST "http://localhost:8081/api/metadata/receipts" \
  -F "invoiceNo=INV-001" \
  -F "purchaseDate=2023-10-24" \
  -F "amount=1000.00" \
  -F "itemName=Laptop Computer" \
  -F "ownerAddress=0x1234567890123456789012345678901234567890" \
  -F "image=@receipt.jpg"
```

**Response**:

```json
{
  "metadataUrl": "http://localhost:8081/api/metadata/download?key=metadata/metadata_INV-001_uuid.json",
  "metaHash": "a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456"
}
```

**Error Responses**:

| Status | Description                            |
| ------ | -------------------------------------- |
| 400    | Invalid input data (validation errors) |
| 500    | Internal server error                  |

### 2. Get Metadata Hash

Retrieve the SHA-256 hash of metadata from a given URL.

**Endpoint**: `GET /api/metadata/hash`

**Parameters**:

| Parameter | Type   | Required | Description  |
| --------- | ------ | -------- | ------------ |
| `url`     | string | Yes      | Metadata URL |

**Example Request**:

```bash
curl "http://localhost:8081/api/metadata/hash?url=http://localhost:8081/api/metadata/download?key=metadata/metadata_INV-001_uuid.json"
```

**Response**:

```json
{
  "metaHash": "a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456"
}
```

**Error Responses**:

| Status | Description           |
| ------ | --------------------- |
| 400    | Invalid URL format    |
| 404    | Metadata not found    |
| 500    | Internal server error |

### 3. Download File

Download file content from storage by key.

**Endpoint**: `GET /api/metadata/download`

**Parameters**:

| Parameter | Type   | Required | Description         |
| --------- | ------ | -------- | ------------------- |
| `key`     | string | Yes      | File key in storage |

**Example Request**:

```bash
curl "http://localhost:8081/api/metadata/download?key=metadata/metadata_INV-001_uuid.json"
```

**Response**:

- For metadata files: JSON content
- For image files: Binary content with appropriate Content-Type

**Error Responses**:

| Status | Description           |
| ------ | --------------------- |
| 404    | File not found        |
| 500    | Internal server error |

## Data Models

### ReceiptUploadResponse

```json
{
  "metadataUrl": "string",
  "metaHash": "string"
}
```

### HashVerificationResponse

```json
{
  "metaHash": "string"
}
```

### MetadataJson (Internal)

```json
{
  "invoiceNo": "string",
  "purchaseDate": "2023-10-24",
  "amount": 1000.0,
  "itemName": "string",
  "ownerAddress": "0x1234567890123456789012345678901234567890",
  "imageUrl": "string",
  "timestamp": 1698163200000
}
```

## Validation Rules

### Input Validation

- **invoiceNo**: Required, non-empty string
- **purchaseDate**: Required, valid date in yyyy-MM-dd format
- **amount**: Required, positive decimal number
- **itemName**: Required, non-empty string
- **ownerAddress**: Required, valid Ethereum address (0x + 40 hex characters)
- **image**: Optional, valid image file (if provided)

### File Size Limits

- **Image files**: Maximum 10MB
- **Metadata JSON**: No specific limit (typically < 1KB)

## Storage Backends

### S3 Storage (Default)

- Stores metadata in `metadata/` prefix
- Stores images in `images/` prefix
- Uses LocalStack for local development
- Supports AWS S3 for production

### IPFS Storage (Stub)

- In-memory implementation for development
- Returns IPFS-style URLs (`ipfs://hash`)
- TODO: Implement actual IPFS integration

## Error Handling

### Common Error Scenarios

1. **Validation Errors**: Invalid input data format
2. **Storage Errors**: Failed to upload/download from storage
3. **Hash Calculation Errors**: Failed to calculate SHA-256 hash
4. **Network Errors**: Connection issues with storage backend

### Error Response Format

```json
{
  "timestamp": "2023-10-24T10:30:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "path": "/api/metadata/receipts"
}
```

## Rate Limiting

Currently no rate limiting is implemented. Consider implementing rate limiting for production use.

## Monitoring

### Health Check

**Endpoint**: `GET /actuator/health`

**Response**:

```json
{
  "status": "UP",
  "components": {
    "diskSpace": {
      "status": "UP"
    }
  }
}
```

### Metrics

**Endpoint**: `GET /actuator/metrics`

Available metrics:

- HTTP request metrics
- JVM metrics
- Application-specific metrics

## Examples

### Complete Workflow

1. **Upload receipt metadata**:

   ```bash
   curl -X POST "http://localhost:8081/api/metadata/receipts" \
     -F "invoiceNo=INV-001" \
     -F "purchaseDate=2023-10-24" \
     -F "amount=1000.00" \
     -F "itemName=Laptop" \
     -F "ownerAddress=0x1234567890123456789012345678901234567890"
   ```

2. **Verify metadata hash**:

   ```bash
   curl "http://localhost:8081/api/metadata/hash?url=<metadata_url_from_step_1>"
   ```

3. **Download metadata**:
   ```bash
   curl "http://localhost:8081/api/metadata/download?key=<key_from_step_1>"
   ```

### Integration with Smart Contract

The metadata URL and hash returned by this service can be used in the Smart Contract Service for minting NFTs:

```javascript
// Example usage in Smart Contract Service
const response = await fetch("http://localhost:8081/api/metadata/receipts", {
  method: "POST",
  body: formData,
});

const { metadataUrl, metaHash } = await response.json();

// Use in smart contract minting
await contract.mint(ownerAddress, metadataUrl, metaHash);
```

## Swagger UI

Interactive API documentation is available at:

```
http://localhost:8081/swagger-ui.html
```

## Support

For issues and questions:

1. Check the logs: `docker-compose logs metadata-service`
2. Verify configuration: Check environment variables
3. Test connectivity: Ensure LocalStack is running
4. Review API documentation: Visit Swagger UI


