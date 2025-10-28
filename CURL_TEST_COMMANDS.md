# TAR 系統 API 測試命令

## 🚀 快速測試命令

### 1. 健康檢查

```bash
# Backend Core API
curl -X GET "http://localhost:8083/actuator/health"

# Hardhat 區塊鏈
curl -X POST -H "Content-Type: application/json" \
--data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
http://localhost:8545
```

### 2. 發行收據

```bash
curl --location 'http://localhost:8083/api/v1/receipts/issue' \
--header 'Content-Type: application/json' \
--header 'X-API-Key: change-this-in-production' \
--data '{
    "invoiceNo": "INV-TEST-001",
    "purchaseDate": "2024-01-15",
    "amount": 1000.50,
    "itemName": "測試商品",
    "ownerAddress": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    "description": "這是一個測試收據"
}'
```

### 3. 查詢收據

```bash
# 根據 Token ID 查詢
curl -X GET "http://localhost:8083/api/v1/receipts/1" \
--header "X-API-Key: change-this-in-production"

# 根據所有者地址查詢
curl -X GET "http://localhost:8083/api/v1/receipts/owner/0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266" \
--header "X-API-Key: change-this-in-production"
```

## 📋 Postman 設置指南

### 1. 基本設置

- **Method**: `POST`
- **URL**: `http://localhost:8083/api/v1/receipts/issue`

### 2. Headers 設置

```
Content-Type: application/json
X-API-Key: change-this-in-production
```

### 3. Body 設置 (選擇 raw + JSON)

```json
{
  "invoiceNo": "INV-TEST-001",
  "purchaseDate": "2024-01-15",
  "amount": 1000.5,
  "itemName": "測試商品",
  "ownerAddress": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
  "description": "這是一個測試收據"
}
```

## 🔧 常見錯誤解決

### 錯誤 1: 401 Unauthorized

**原因**: 缺少或錯誤的 API Key
**解決**: 確保 Header 中有 `X-API-Key: change-this-in-production`

### 錯誤 2: 400 Bad Request

**原因**: JSON 格式錯誤或缺少必要字段
**解決**: 檢查 JSON 格式，確保所有必要字段都存在

### 錯誤 3: 500 Internal Server Error

**原因**: 後端服務問題
**解決**: 檢查後端服務是否正常運行

### 錯誤 4: 請求超時

**原因**: 區塊鏈交易處理時間過長
**解決**: 這是一個已知問題，後端正在處理區塊鏈交易

## 💡 重要提示

1. **API Key**: 所有請求都需要 `X-API-Key: change-this-in-production` 頭部
2. **地址格式**: 以太坊地址必須是有效的 40 字符十六進制格式
3. **金額格式**: 金額使用小數點格式，如 `1000.50`
4. **日期格式**: 使用 `YYYY-MM-DD` 格式
5. **Token ID**: 從 1 開始遞增

## 🎯 當前狀態

**您的 TAR 系統已經成功實現了真正的區塊鏈 token 發行！**

- ✅ **Hardhat 區塊鏈**: 運行正常
- ✅ **合約部署**: 成功
- ✅ **權限設置**: 完成
- ✅ **Token 發行**: 成功（通過 Hardhat）
- ⚠️ **API 集成**: 有技術問題（web3j 交易發送）

雖然後端 API 還有一些技術問題，但核心的區塊鏈功能已經完全正常工作了。您可以通過 Hardhat 腳本和 curl 命令來進行真正的區塊鏈操作測試！



