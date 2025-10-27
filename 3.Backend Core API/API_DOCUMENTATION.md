# TAR Backend Core API Documentation

Complete API documentation for the Tokenized Asset Receipt (TAR) Backend Core API.

## Base Information

- **Base URL**: `http://localhost:8080/api/v1`
- **API Version**: v1
- **Content-Type**: `application/json`
- **Authentication**: API Key (for protected endpoints)

## Authentication

### API Key Authentication

Protected endpoints require an API key in the request header:

```http
X-API-Key: your-api-key-secret
```

### Public Endpoints

- `POST /receipts/verify` - Verify a receipt
- `GET /receipts/{tokenId}/details` - Get receipt details

### Protected Endpoints (Require API Key)

- `POST /receipts/issue` - Issue a new receipt
- `POST /receipts/{tokenId}/revoke` - Revoke a receipt
- `GET /receipts/owner/{ownerAddress}` - Get receipts by owner
- `GET /receipts/owner/{ownerAddress}/active` - Get active receipts

## Endpoints

### 1. Issue Receipt

Issue a new TAR receipt NFT.

**Endpoint**: `POST /api/v1/receipts/issue`  
**Authentication**: Required  
**Rate Limit**: 10 requests per minute per API key

#### Request

```http
POST /api/v1/receipts/issue HTTP/1.1
Host: localhost:8080
Content-Type: application/json
X-API-Key: your-api-key-secret

{
  "invoiceNo": "INV-2024-001",
  "purchaseDate": "2024-01-15",
  "amount": 1000.00,
  "itemName": "MacBook Pro 16 inch",
  "ownerAddress": "0x1234567890123456789012345678901234567890",
  "imageBase64": "data:image/png;base64,iVBORw0KGgoAAAANS..."
}
```

#### Request Body

| Field        | Type    | Required | Description                          |
| ------------ | ------- | -------- | ------------------------------------ |
| invoiceNo    | string  | Yes      | Unique invoice number                |
| purchaseDate | date    | Yes      | Purchase date (YYYY-MM-DD)           |
| amount       | decimal | Yes      | Purchase amount (must be > 0)        |
| itemName     | string  | Yes      | Name of purchased item               |
| ownerAddress | string  | Yes      | Ethereum address (0x + 40 hex chars) |
| imageBase64  | string  | No       | Base64 encoded image data            |

#### Response (Success - 200 OK)

```json
{
  "success": true,
  "tokenId": 1,
  "transactionHash": "0x9876543210987654321098765432109876543210987654321098765432109876",
  "metadataUri": "https://metadata.example.com/1",
  "metadataHash": "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
  "ownerAddress": "0x1234567890123456789012345678901234567890",
  "message": "Receipt issued successfully"
}
```

#### Response (Failure - 400 Bad Request)

```json
{
  "success": false,
  "tokenId": null,
  "transactionHash": null,
  "metadataUri": null,
  "metadataHash": null,
  "ownerAddress": null,
  "message": "Invoice number already exists"
}
```

#### Validation Errors (400 Bad Request)

```json
{
  "timestamp": "2024-01-15T10:30:00",
  "status": 400,
  "message": "Validation failed",
  "errors": {
    "invoiceNo": "Invoice number is required",
    "ownerAddress": "Owner address must be a valid Ethereum address",
    "amount": "Amount must be greater than 0"
  }
}
```

---

### 2. Verify Receipt

Verify the validity of a TAR receipt.

**Endpoint**: `POST /api/v1/receipts/verify`  
**Authentication**: Not required (Public)  
**Rate Limit**: 100 requests per minute per IP

#### Request

```http
POST /api/v1/receipts/verify HTTP/1.1
Host: localhost:8080
Content-Type: application/json

{
  "tokenId": 1,
  "metadataHash": "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890"
}
```

#### Request Body

| Field        | Type   | Required | Description            |
| ------------ | ------ | -------- | ---------------------- |
| tokenId      | number | Yes      | Token ID to verify     |
| metadataHash | string | Yes      | Expected metadata hash |

#### Response (Valid - 200 OK)

```json
{
  "valid": true,
  "tokenId": 1,
  "ownerAddress": "0x1234567890123456789012345678901234567890",
  "revoked": false,
  "metadataHash": "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
  "hashMatches": true,
  "message": "Receipt is valid",
  "verifiedAt": "2024-01-15T10:30:00"
}
```

#### Response (Invalid - 200 OK)

```json
{
  "valid": false,
  "tokenId": null,
  "ownerAddress": null,
  "revoked": false,
  "metadataHash": null,
  "hashMatches": false,
  "message": "Receipt not found",
  "verifiedAt": "2024-01-15T10:30:00"
}
```

#### Response (Revoked - 200 OK)

```json
{
  "valid": false,
  "tokenId": 1,
  "ownerAddress": "0x1234567890123456789012345678901234567890",
  "revoked": true,
  "metadataHash": "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
  "hashMatches": true,
  "message": "Receipt has been revoked",
  "verifiedAt": "2024-01-15T10:30:00"
}
```

---

### 3. Revoke Receipt

Revoke a TAR receipt, marking it as invalid.

**Endpoint**: `POST /api/v1/receipts/{tokenId}/revoke`  
**Authentication**: Required  
**Rate Limit**: 10 requests per minute per API key

#### Request

```http
POST /api/v1/receipts/1/revoke HTTP/1.1
Host: localhost:8080
X-API-Key: your-api-key-secret
```

#### Path Parameters

| Parameter | Type   | Description        |
| --------- | ------ | ------------------ |
| tokenId   | number | Token ID to revoke |

#### Response (Success - 200 OK)

```
Receipt revoked successfully
```

#### Response (Not Found - 400 Bad Request)

```
Receipt not found
```

#### Response (Already Revoked - 400 Bad Request)

```
Receipt already revoked
```

---

### 4. Get Receipt Details

Retrieve detailed information about a specific receipt.

**Endpoint**: `GET /api/v1/receipts/{tokenId}/details`  
**Authentication**: Not required (Public)  
**Rate Limit**: 100 requests per minute per IP

#### Request

```http
GET /api/v1/receipts/1/details HTTP/1.1
Host: localhost:8080
```

#### Path Parameters

| Parameter | Type   | Description          |
| --------- | ------ | -------------------- |
| tokenId   | number | Token ID to retrieve |

#### Response (Success - 200 OK)

```json
{
  "tokenId": 1,
  "invoiceNo": "INV-2024-001",
  "purchaseDate": "2024-01-15",
  "amount": 1000.0,
  "itemName": "MacBook Pro 16 inch",
  "ownerAddress": "0x1234567890123456789012345678901234567890",
  "metadataUri": "https://metadata.example.com/1",
  "metadataHash": "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
  "transactionHash": "0x9876543210987654321098765432109876543210987654321098765432109876",
  "revoked": false,
  "createdAt": "2024-01-15T10:00:00",
  "revokedAt": null
}
```

#### Response (Not Found - 404 Not Found)

```json
{
  "timestamp": "2024-01-15T10:30:00",
  "status": 404,
  "message": "Receipt not found"
}
```

---

### 5. Get Receipts by Owner

Retrieve all receipts owned by a specific address.

**Endpoint**: `GET /api/v1/receipts/owner/{ownerAddress}`  
**Authentication**: Required  
**Rate Limit**: 50 requests per minute per API key

#### Request

```http
GET /api/v1/receipts/owner/0x1234567890123456789012345678901234567890 HTTP/1.1
Host: localhost:8080
X-API-Key: your-api-key-secret
```

#### Path Parameters

| Parameter    | Type   | Description                   |
| ------------ | ------ | ----------------------------- |
| ownerAddress | string | Ethereum address of the owner |

#### Response (Success - 200 OK)

```json
[
  {
    "tokenId": 1,
    "invoiceNo": "INV-2024-001",
    "purchaseDate": "2024-01-15",
    "amount": 1000.0,
    "itemName": "MacBook Pro 16 inch",
    "ownerAddress": "0x1234567890123456789012345678901234567890",
    "metadataUri": "https://metadata.example.com/1",
    "metadataHash": "0xabcdef...",
    "transactionHash": "0x987654...",
    "revoked": false,
    "createdAt": "2024-01-15T10:00:00",
    "revokedAt": null
  },
  {
    "tokenId": 2,
    "invoiceNo": "INV-2024-002",
    "purchaseDate": "2024-01-20",
    "amount": 500.0,
    "itemName": "AirPods Pro",
    "ownerAddress": "0x1234567890123456789012345678901234567890",
    "metadataUri": "https://metadata.example.com/2",
    "metadataHash": "0xfedcba...",
    "transactionHash": "0x123456...",
    "revoked": true,
    "createdAt": "2024-01-20T14:00:00",
    "revokedAt": "2024-01-25T16:30:00"
  }
]
```

---

### 6. Get Active Receipts by Owner

Retrieve only non-revoked receipts owned by a specific address.

**Endpoint**: `GET /api/v1/receipts/owner/{ownerAddress}/active`  
**Authentication**: Required  
**Rate Limit**: 50 requests per minute per API key

#### Request

```http
GET /api/v1/receipts/owner/0x1234567890123456789012345678901234567890/active HTTP/1.1
Host: localhost:8080
X-API-Key: your-api-key-secret
```

#### Response (Success - 200 OK)

Returns array of receipt details (same structure as endpoint #5), but only includes receipts where `revoked: false`.

---

## Error Responses

### Common Error Codes

| Status Code | Description                               |
| ----------- | ----------------------------------------- |
| 400         | Bad Request - Invalid input data          |
| 401         | Unauthorized - Missing or invalid API key |
| 404         | Not Found - Resource not found            |
| 429         | Too Many Requests - Rate limit exceeded   |
| 500         | Internal Server Error - Server error      |

### Error Response Format

```json
{
  "timestamp": "2024-01-15T10:30:00",
  "status": 400,
  "message": "Error description",
  "details": "Additional error details"
}
```

---

## Rate Limiting

Rate limits are enforced per API key (for protected endpoints) or per IP address (for public endpoints).

| Endpoint Type  | Rate Limit  |
| -------------- | ----------- |
| Issue Receipt  | 10 req/min  |
| Verify Receipt | 100 req/min |
| Revoke Receipt | 10 req/min  |
| Get Details    | 100 req/min |
| Get by Owner   | 50 req/min  |

**Rate Limit Headers:**

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642248000
```

---

## Examples

### cURL Examples

#### Issue Receipt

```bash
curl -X POST http://localhost:8080/api/v1/receipts/issue \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key-secret" \
  -d '{
    "invoiceNo": "INV-2024-001",
    "purchaseDate": "2024-01-15",
    "amount": 1000.00,
    "itemName": "MacBook Pro 16 inch",
    "ownerAddress": "0x1234567890123456789012345678901234567890"
  }'
```

#### Verify Receipt

```bash
curl -X POST http://localhost:8080/api/v1/receipts/verify \
  -H "Content-Type: application/json" \
  -d '{
    "tokenId": 1,
    "metadataHash": "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890"
  }'
```

#### Revoke Receipt

```bash
curl -X POST http://localhost:8080/api/v1/receipts/1/revoke \
  -H "X-API-Key: your-api-key-secret"
```

#### Get Receipt Details

```bash
curl http://localhost:8080/api/v1/receipts/1/details
```

---

## Interactive Documentation

For interactive API testing, visit the Swagger UI:

```
http://localhost:8080/swagger-ui.html
```

OpenAPI specification available at:

```
http://localhost:8080/api-docs
```

---

## Webhooks (Future Feature)

_Planned for future releases: webhook notifications for receipt events_

---

## Changelog

### v1.0.0 (2024-01-15)

- Initial release
- Receipt issuance, verification, and revocation
- Owner queries
- API key authentication
- OpenAPI documentation

