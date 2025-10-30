# TAR Backend Core API - 完整 curl 測試文檔

## 🚀 服務狀態

### 健康檢查

```bash
curl -X GET http://localhost:8080/actuator/health
```

**預期響應:**

```json
{ "status": "UP" }
```

---

## 📋 API 端點測試

### 1. 發行收據 (Issue Receipt)

**端點:** `POST /api/v1/receipts/issue`  
**認證:** 需要 API Key  
**描述:** 發行新的 TAR 收據

```bash
curl -X POST http://localhost:8080/api/v1/receipts/issue \
  -H "Content-Type: application/json" \
  -H "X-API-Key: change-this-in-production" \
  -d '{
    "invoiceNo": "INV-001",
    "purchaseDate": "2024-01-01",
    "amount": 100.50,
    "itemName": "Gold Bar",
    "ownerAddress": "0x1234567890123456789012345678901234567890",
    "description": "High purity gold bar",
    "metadata": {
      "purity": "99.9%",
      "weight": "100g"
    }
  }'
```

**預期響應:**

```json
{
  "tokenId": 650575,
  "transactionHash": "0x19a21ae1e8f",
  "metadataUri": "ipfs://0edec501-c45b-4397-b73a-58d9d8756717",
  "metadataHash": "8c8e949a6debccd9a3a1e4e1c9daba7a46b69bd65a43cacdc71c535fe9b6e94f",
  "ownerAddress": "0x1234567890123456789012345678901234567890",
  "success": true,
  "message": "Receipt issued successfully"
}
```

---

### 2. 驗證收據 (Verify Receipt)

**端點:** `POST /api/v1/receipts/verify`  
**認證:** 公開端點  
**描述:** 驗證收據的有效性

```bash
curl -X POST http://localhost:8080/api/v1/receipts/verify \
  -H "Content-Type: application/json" \
  -d '{
    "tokenId": 650575,
    "metadataHash": "8c8e949a6debccd9a3a1e4e1c9daba7a46b69bd65a43cacdc71c535fe9b6e94f"
  }'
```

**預期響應:**

```json
{
  "valid": true,
  "tokenId": 650575,
  "ownerAddress": "0x1234567890123456789012345678901234567890",
  "revoked": false,
  "metadataHash": "8c8e949a6debccd9a3a1e4e1c9daba7a46b69bd65a43cacdc71c535fe9b6e94f",
  "hashMatches": true,
  "message": "Receipt is valid",
  "verifiedAt": "2025-10-27T02:00:52.285977"
}
```

---

### 3. 獲取收據詳情 (Get Receipt Details)

**端點:** `GET /api/v1/receipts/{tokenId}/details`  
**認證:** 公開端點  
**描述:** 查詢特定收據的詳細信息

```bash
curl -X GET http://localhost:8080/api/v1/receipts/650575/details
```

**預期響應:**

```json
{
  "tokenId": 650575,
  "invoiceNo": "INV-001",
  "purchaseDate": "2024-01-01",
  "amount": 100.5,
  "itemName": "Gold Bar",
  "ownerAddress": "0x1234567890123456789012345678901234567890",
  "metadataUri": "ipfs://0edec501-c45b-4397-b73a-58d9d8756717",
  "metadataHash": "8c8e949a6debccd9a3a1e4e1c9daba7a46b69bd65a43cacdc71c535fe9b6e94f",
  "transactionHash": "0x19a21ae1e8f",
  "revoked": false,
  "createdAt": "2025-10-27T02:00:50.579424",
  "revokedAt": null
}
```

---

### 4. 撤銷收據 (Revoke Receipt)

**端點:** `POST /api/v1/receipts/{tokenId}/revoke`  
**認證:** 需要 API Key  
**描述:** 撤銷指定的收據

```bash
curl -X POST http://localhost:8080/api/v1/receipts/650575/revoke \
  -H "Content-Type: application/json" \
  -H "X-API-Key: change-this-in-production"
```

**預期響應:**

```
Receipt revoked successfully
```

---

### 5. 查詢擁有者的所有收據 (Get Owner's All Receipts)

**端點:** `GET /api/v1/receipts/owner/{address}`  
**認證:** 需要 API Key  
**描述:** 查詢指定地址擁有的所有收據

```bash
curl -X GET http://localhost:8080/api/v1/receipts/owner/0x1234567890123456789012345678901234567890 \
  -H "X-API-Key: change-this-in-production"
```

**預期響應:**

```json
[
  {
    "tokenId": 650575,
    "invoiceNo": "INV-001",
    "purchaseDate": "2024-01-01",
    "amount": 100.5,
    "itemName": "Gold Bar",
    "ownerAddress": "0x1234567890123456789012345678901234567890",
    "metadataUri": "ipfs://0edec501-c45b-4397-b73a-58d9d8756717",
    "metadataHash": "8c8e949a6debccd9a3a1e4e1c9daba7a46b69bd65a43cacdc71c535fe9b6e94f",
    "transactionHash": "0x19a21ae1e8f",
    "revoked": true,
    "createdAt": "2025-10-27T02:00:50.579424",
    "revokedAt": "2025-10-27T02:00:55.326456"
  }
]
```

---

### 6. 查詢擁有者的有效收據 (Get Owner's Active Receipts)

**端點:** `GET /api/v1/receipts/owner/{address}/active`  
**認證:** 需要 API Key  
**描述:** 查詢指定地址擁有的有效收據（未撤銷）

```bash
curl -X GET http://localhost:8080/api/v1/receipts/owner/0x1234567890123456789012345678901234567890/active \
  -H "X-API-Key: change-this-in-production"
```

**預期響應:**

```json
[]
```

---

## 🔧 錯誤處理測試

### 無效的 API Key

```bash
curl -X POST http://localhost:8080/api/v1/receipts/issue \
  -H "Content-Type: application/json" \
  -H "X-API-Key: invalid-key" \
  -d '{"invoiceNo": "INV-002", "purchaseDate": "2024-01-01", "amount": 50.0, "itemName": "Silver Coin", "ownerAddress": "0x1234567890123456789012345678901234567890"}'
```

**預期響應:** `403 Forbidden`

### 缺少必要字段

```bash
curl -X POST http://localhost:8080/api/v1/receipts/issue \
  -H "Content-Type: application/json" \
  -H "X-API-Key: change-this-in-production" \
  -d '{"invoiceNo": "INV-003"}'
```

**預期響應:**

```json
{
  "message": "Validation failed",
  "errors": {
    "itemName": "Item name is required",
    "purchaseDate": "Purchase date is required",
    "amount": "Amount is required",
    "ownerAddress": "Owner address is required"
  },
  "timestamp": "2025-10-27T02:00:00.000000",
  "status": 400
}
```

### 不存在的收據

```bash
curl -X GET http://localhost:8080/api/v1/receipts/999999/details
```

**預期響應:** `404 Not Found`

---

## 📊 測試結果總結

| 端點                                      | 狀態 | 認證    | 測試結果 |
| ----------------------------------------- | ---- | ------- | -------- |
| `/actuator/health`                        | ✅   | 無      | 正常     |
| `/api/v1/receipts/issue`                  | ✅   | API Key | 正常     |
| `/api/v1/receipts/verify`                 | ✅   | 無      | 正常     |
| `/api/v1/receipts/{id}/details`           | ✅   | 無      | 正常     |
| `/api/v1/receipts/{id}/revoke`            | ✅   | API Key | 正常     |
| `/api/v1/receipts/owner/{address}`        | ✅   | API Key | 正常     |
| `/api/v1/receipts/owner/{address}/active` | ✅   | API Key | 正常     |

**所有端點測試通過！** 🎉

---

## 🔑 重要配置

- **API Key:** `change-this-in-production`
- **Base URL:** `http://localhost:8080`
- **Metadata Service:** `http://localhost:8081`
- **數據庫:** H2 (內存數據庫)

---

## 📝 注意事項

1. 確保 Metadata Service 在端口 8081 運行
2. API Key 認證對需要認證的端點是必需的
3. 所有日期格式為 `YYYY-MM-DD`
4. 以太坊地址必須是有效的 42 字符格式
5. 金額使用 BigDecimal 格式
