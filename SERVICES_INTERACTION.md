# Backend Core API 與 Metadata Service 互動說明

## 概述

**Backend Core API** (端口 8083) 和 **Metadata Service** (端口 8081) 是兩個獨立的微服務，通過 REST API 進行通信。Backend Core API 作為協調者，負責業務邏輯和區塊鏈操作，而 Metadata Service 專門處理元數據的存儲和管理。

## 架構圖

```
┌─────────────────────────────────────────────────────────────┐
│                    Backend Core API                         │
│                    (端口 8083)                              │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  TarReceiptController                                │  │
│  │    POST /api/v1/receipts/issue                      │  │
│  └──────────────────────────────────────────────────────┘  │
│                        │                                     │
│                        ▼                                     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  TarReceiptService                                   │  │
│  │    - issueReceipt()                                  │  │
│  │    - verifyReceipt()                                 │  │
│  └──────────────────────────────────────────────────────┘  │
│                        │                                     │
│                        ▼                                     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  MetadataServiceClient                               │  │
│  │    (使用 WebClient)                                  │  │
│  │    - uploadMetadata()                                │  │
│  │    - verifyMetadataHash()                            │  │
│  └──────────────────────────────────────────────────────┘  │
│                        │                                     │
│                        │ HTTP REST API                       │
└────────────────────────┼─────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  Metadata Service                            │
│                  (端口 8081)                                 │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  MetadataController                                   │  │
│  │    POST /api/metadata/receipts                       │  │
│  │    GET  /api/metadata/hash                            │  │
│  │    GET  /api/metadata/download                       │  │
│  └──────────────────────────────────────────────────────┘  │
│                        │                                     │
│                        ▼                                     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  MetadataService                                     │  │
│  │    - uploadReceipt()                                 │  │
│  │    - getMetadataHash()                               │  │
│  │    - downloadMetadata()                              │  │
│  └──────────────────────────────────────────────────────┘  │
│                        │                                     │
│                        ▼                                     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  StorageAdapter (S3/IPFS)                            │  │
│  │    - 存儲 metadata JSON 和圖片                     │  │
│  │    - 計算 SHA-256 hash                              │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## 主要交互流程

### 1. 發行 Receipt (Issue Receipt)

當用戶請求發行一個新的 TAR receipt 時，流程如下：

```
用戶請求
  │
  ▼
Backend Core API: POST /api/v1/receipts/issue
  │
  ├─► Step 1: 檢查 invoiceNo 是否已存在（數據庫查詢）
  │
  ├─► Step 2: 調用 Metadata Service
  │     │
  │     └─► HTTP POST http://localhost:8081/api/metadata/receipts
  │         Content-Type: multipart/form-data
  │         Body:
  │           - invoiceNo: string
  │           - purchaseDate: string (yyyy-MM-dd)
  │           - amount: string
  │           - itemName: string
  │           - ownerAddress: string (Ethereum address)
  │           - imageBase64: string (optional)
  │
  │     ┌─► Metadata Service 處理：
  │     │   1. 驗證輸入數據
  │     │   2. 創建 metadata JSON
  │     │   3. 處理圖片（如果有）
  │     │   4. 上傳到存儲（S3/IPFS）
  │     │   5. 計算 SHA-256 hash
  │     │   6. 返回 metadataUrl 和 metaHash
  │     │
  │     └─► Response:
  │         {
  │           "metadataUrl": "http://localhost:8081/api/metadata/download?key=...",
  │           "metaHash": "0xabcd1234..."
  │         }
  │
  ├─► Step 3: 鑄造 NFT 到區塊鏈
  │     │
  │     └─► BlockchainService.mintReceipt(
  │           ownerAddress,
  │           metadataUrl,    // 來自 Metadata Service
  │           metadataHash    // 來自 Metadata Service
  │         )
  │
  └─► Step 4: 保存到數據庫
        │
        └─► 保存 receipt 記錄（包含 tokenId, metadataUri, metadataHash 等）
```

**代碼位置**：
- Backend Core API: `TarReceiptService.issueReceipt()`
- Metadata Service Client: `MetadataServiceClient.uploadMetadata()`
- Metadata Service: `MetadataController.uploadReceipt()`

### 2. 驗證 Receipt (Verify Receipt)

驗證流程主要在 Backend Core API 內部完成，但會使用 Metadata Service 返回的 hash 進行比對：

```
用戶請求
  │
  ▼
Backend Core API: POST /api/v1/receipts/verify
  │
  ├─► Step 1: 查詢數據庫中的 receipt 記錄
  │
  ├─► Step 2: 檢查是否已撤銷（數據庫和區塊鏈）
  │
  ├─► Step 3: 驗證區塊鏈上的數據
  │     │
  │     └─► BlockchainService.verifyReceipt(
  │           tokenId,
  │           metadataHash  // 與數據庫中存儲的 hash 比對
  │         )
  │
  └─► Step 4: 返回驗證結果
```

**注意**：目前驗證流程主要依賴區塊鏈驗證，Metadata Service 提供的 `verifyMetadataHash()` 方法在代碼中存在但未被實際使用。

## 通信技術細節

### 1. HTTP 客戶端配置

**Backend Core API** 使用 Spring WebClient（響應式 HTTP 客戶端）來調用 Metadata Service：

```java
// WebClientConfig.java
@Configuration
public class WebClientConfig {
    @Value("${metadata-service.base-url}")
    private String metadataServiceBaseUrl;

    @Bean
    public WebClient metadataServiceWebClient() {
        return WebClient.builder()
                .baseUrl(metadataServiceBaseUrl)
                .build();
    }
}
```

### 2. 配置

**Backend Core API** 的配置（`application.yml`）：

```yaml
metadata-service:
  base-url: ${METADATA_SERVICE_URL:http://localhost:8081}
```

環境變量設置：
```bash
METADATA_SERVICE_URL=http://localhost:8081
```

### 3. API 端點對應

| Backend Core API | Metadata Service | 說明 |
|------------------|------------------|------|
| `MetadataServiceClient.uploadMetadata()` | `POST /api/metadata/receipts` | 上傳 metadata |
| `MetadataServiceClient.verifyMetadataHash()` | `POST /api/v1/metadata/verify` | 驗證 hash（未使用） |

### 4. 數據格式

**上傳請求格式**（multipart/form-data）：
```http
POST /api/metadata/receipts HTTP/1.1
Host: localhost:8081
Content-Type: multipart/form-data

invoiceNo=INV-001
purchaseDate=2024-01-15
amount=1000.00
itemName=MacBook Pro
ownerAddress=0x1234567890123456789012345678901234567890
imageBase64=data:image/png;base64,...
```

**響應格式**：
```json
{
  "metadataUrl": "http://localhost:8081/api/metadata/download?key=metadata/metadata_INV-001_uuid.json",
  "metaHash": "0xa1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456"
}
```

## 錯誤處理

### 連接失敗

如果 Metadata Service 不可用，Backend Core API 會拋出異常：

```java
try {
    MetadataUploadResult result = metadataServiceClient.uploadMetadata(...);
} catch (Exception e) {
    // 返回失敗響應
    return IssueReceiptResponse.failure("Failed to upload metadata: " + e.getMessage());
}
```

### 常見錯誤場景

1. **Metadata Service 未運行**
   - 錯誤：`Connection refused` 或超時
   - 解決：確保 Metadata Service 在端口 8081 運行

2. **配置錯誤**
   - 錯誤：無法解析 base URL
   - 解決：檢查 `METADATA_SERVICE_URL` 環境變量

3. **數據格式錯誤**
   - 錯誤：Metadata Service 返回 400 Bad Request
   - 解決：檢查請求參數格式

## 服務獨立性

這兩個服務是完全獨立的：

- ✅ **獨立部署**：可以分別啟動和停止
- ✅ **獨立數據庫**：Backend Core API 使用 PostgreSQL，Metadata Service 使用 S3/IPFS 存儲
- ✅ **獨立端口**：Backend Core API (8083)，Metadata Service (8081)
- ✅ **松耦合**：通過 REST API 通信，易於替換和擴展

## 測試建議

### 1. 檢查 Metadata Service 是否可訪問

```bash
curl http://localhost:8081/actuator/health
```

### 2. 測試完整流程

```bash
# 1. 發行 receipt（會自動調用 Metadata Service）
curl -X POST http://localhost:8083/api/v1/receipts/issue \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key-secret" \
  -d '{
    "invoiceNo": "INV-001",
    "purchaseDate": "2024-01-15",
    "amount": 1000.00,
    "itemName": "Test Item",
    "ownerAddress": "0x1234567890123456789012345678901234567890"
  }'

# 2. 驗證 receipt
curl -X POST http://localhost:8083/api/v1/receipts/verify \
  -H "Content-Type: application/json" \
  -d '{
    "tokenId": 1,
    "metadataHash": "0x..."
  }'
```

## 總結

**Backend Core API** 作為系統的主要入口點，負責：
- 接收用戶請求
- 調用 Metadata Service 處理元數據
- 與區塊鏈交互
- 管理數據庫記錄

**Metadata Service** 專注於：
- 元數據的存儲和管理
- Hash 計算和驗證
- 文件（圖片、JSON）的存儲和檢索

兩個服務通過標準的 REST API 進行通信，實現了清晰的職責分離和服務解耦。

