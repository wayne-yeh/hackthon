# TAR Verification Service - API 文檔

## 概述

TAR Verification Service 提供 RESTful API 來驗證 Tokenized Asset Receipt (TAR) NFT 的有效性。服務通過比較元數據哈希與鏈上存儲的哈希來確保數據完整性。

## 基礎信息

- **Base URL**: `http://localhost:8082`
- **API 版本**: v1
- **協議**: HTTP/HTTPS
- **數據格式**: JSON
- **認證**: 無需認證（公開 API）

## 端點列表

### 1. Token 驗證

#### GET /api/verify

通過 tokenId 驗證 NFT 的有效性。

**請求參數**:

- `tokenId` (required): NFT 的 token ID

**請求示例**:

```http
GET /api/verify?tokenId=123
```

**響應格式**:

```json
{
  "valid": true,
  "reasons": [],
  "owner": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
  "tokenURI": "https://metadata.example.com/token/123",
  "revoked": false,
  "metadataHash": "a1b2c3d4e5f6...",
  "storedHash": "a1b2c3d4e5f6...",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**響應字段說明**:

- `valid`: 驗證結果 (boolean)
- `reasons`: 無效原因列表 (string[])
- `owner`: Token 擁有者地址 (string)
- `tokenURI`: Token 元數據 URI (string)
- `revoked`: 是否已撤銷 (boolean)
- `metadataHash`: 計算的元數據哈希 (string)
- `storedHash`: 鏈上存儲的哈希 (string)
- `timestamp`: 驗證時間戳 (string)

**錯誤響應**:

```json
{
  "valid": false,
  "reasons": ["Token not found", "Metadata fetch failed"],
  "owner": null,
  "tokenURI": null,
  "revoked": false,
  "metadataHash": null,
  "storedHash": null,
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**HTTP 狀態碼**:

- `200 OK`: 驗證成功
- `400 Bad Request`: 無效的 tokenId
- `404 Not Found`: Token 不存在
- `500 Internal Server Error`: 服務器錯誤

### 2. 健康檢查

#### GET /api/verify/health

檢查服務健康狀態。

**請求示例**:

```http
GET /api/verify/health
```

**響應格式**:

```json
{
  "status": "UP",
  "details": {
    "blockchain": "UP",
    "metadata": "UP"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**響應字段說明**:

- `status`: 整體健康狀態 (UP/DOWN)
- `details`: 各組件健康狀態
- `timestamp`: 檢查時間戳

**HTTP 狀態碼**:

- `200 OK`: 服務正常
- `503 Service Unavailable`: 服務異常

## 錯誤處理

### 錯誤響應格式

```json
{
  "error": "Validation failed",
  "message": "Invalid tokenId format",
  "timestamp": "2024-01-15T10:30:00Z",
  "path": "/api/verify"
}
```

### 常見錯誤

#### 400 Bad Request

```json
{
  "error": "Bad Request",
  "message": "tokenId is required",
  "timestamp": "2024-01-15T10:30:00Z",
  "path": "/api/verify"
}
```

#### 404 Not Found

```json
{
  "error": "Not Found",
  "message": "Token not found",
  "timestamp": "2024-01-15T10:30:00Z",
  "path": "/api/verify"
}
```

#### 500 Internal Server Error

```json
{
  "error": "Internal Server Error",
  "message": "Blockchain connection failed",
  "timestamp": "2024-01-15T10:30:00Z",
  "path": "/api/verify"
}
```

## 驗證流程

### 1. 接收請求

- 驗證 tokenId 格式
- 檢查必要參數

### 2. 區塊鏈查詢

- 調用合約 `ownerOf(tokenId)`
- 調用合約 `tokenURI(tokenId)`
- 調用合約 `verify(tokenId)`
- 檢查撤銷狀態

### 3. 元數據獲取

- 從 tokenURI 獲取元數據
- 驗證 JSON 格式
- 計算 SHA-256 哈希

### 4. 哈希比較

- 比較計算的哈希與鏈上存儲的哈希
- 檢查撤銷狀態

### 5. 結果返回

- 生成驗證結果
- 記錄驗證日誌
- 返回響應

## 使用示例

### cURL 示例

#### 驗證 Token

```bash
curl -X GET "http://localhost:8082/api/verify?tokenId=123" \
  -H "Accept: application/json"
```

#### 健康檢查

```bash
curl -X GET "http://localhost:8082/api/verify/health" \
  -H "Accept: application/json"
```

### JavaScript 示例

#### 驗證 Token

```javascript
async function verifyToken(tokenId) {
  try {
    const response = await fetch(
      `http://localhost:8082/api/verify?tokenId=${tokenId}`
    );
    const result = await response.json();

    if (result.valid) {
      console.log("Token is valid:", result);
    } else {
      console.log("Token is invalid:", result.reasons);
    }

    return result;
  } catch (error) {
    console.error("Verification failed:", error);
    throw error;
  }
}

// 使用示例
verifyToken(123);
```

#### 健康檢查

```javascript
async function checkHealth() {
  try {
    const response = await fetch("http://localhost:8082/api/verify/health");
    const health = await response.json();

    console.log("Service status:", health.status);
    return health;
  } catch (error) {
    console.error("Health check failed:", error);
    throw error;
  }
}
```

### Python 示例

#### 驗證 Token

```python
import requests
import json

def verify_token(token_id):
    url = f"http://localhost:8082/api/verify?tokenId={token_id}"

    try:
        response = requests.get(url)
        response.raise_for_status()

        result = response.json()

        if result['valid']:
            print(f"Token {token_id} is valid")
            print(f"Owner: {result['owner']}")
            print(f"Revoked: {result['revoked']}")
        else:
            print(f"Token {token_id} is invalid")
            print(f"Reasons: {result['reasons']}")

        return result

    except requests.exceptions.RequestException as e:
        print(f"Verification failed: {e}")
        raise

# 使用示例
verify_token(123)
```

## 配置說明

### 環境變量

- `BLOCKCHAIN_RPC_URL`: 區塊鏈 RPC 端點
- `CONTRACT_ADDRESS`: TAR 合約地址
- `METADATA_SERVICE_URL`: 元數據服務 URL
- `SERVER_PORT`: 服務端口（預設 8082）

### 預設配置

- 端口: 8082
- 超時: 10 秒
- 快取: 5 分鐘 TTL
- 日誌級別: INFO

## 監控和日誌

### 日誌格式

```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "level": "INFO",
  "logger": "com.tar.verification.controller.VerificationController",
  "message": "Token verification request",
  "tokenId": "123",
  "duration": "150ms"
}
```

### 監控端點

- `/actuator/health`: 健康檢查
- `/actuator/metrics`: 系統指標
- `/actuator/loggers`: 日誌配置

## 安全考量

### 輸入驗證

- tokenId 必須是有效的數字
- 所有輸入都經過驗證和清理

### 錯誤處理

- 不洩露敏感資訊
- 統一的錯誤響應格式
- 完整的錯誤日誌記錄

### 速率限制

- 建議實施速率限制
- 防止濫用和 DDoS 攻擊

## 版本控制

### API 版本

- 當前版本: v1
- 向後兼容性: 保證
- 版本標頭: 可選

### 變更日誌

- v1.0.0: 初始版本
- 支援基本的 token 驗證功能

## 支援和聯繫

### 文檔

- Swagger UI: http://localhost:8082/swagger-ui.html
- OpenAPI 規範: http://localhost:8082/v3/api-docs

### 測試

- Postman 集合: `TAR_Verification_Service.postman_collection.json`
- 測試腳本: `test-api.sh`

### 問題報告

- 請通過 GitHub Issues 報告問題
- 包含完整的錯誤日誌和重現步驟
