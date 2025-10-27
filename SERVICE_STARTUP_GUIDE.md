# TAR 系統服務啟動指南

## 📋 概述

本指南說明如何從零開始啟動 TAR (Tokenized Asset Receipt) 系統的所有服務，確保 `http://localhost:8083/api/v1/receipts/issue` API 能夠成功運行並真正與區塊鏈交互。

## 🎯 目標

- 啟動所有必要的微服務
- 配置正確的區塊鏈連接
- 確保 API 能夠成功發行代幣到測試鏈
- 提供完整的測試驗證流程

## 🚀 服務啟動順序

### 1. 啟動 Hardhat 區塊鏈服務

```bash
cd "/Users/weiyeh/Desktop/區塊鏈/hackathon/1.Smart Contract Service"
npm run node
```

**等待看到：**

```
Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/
```

### 2. 部署智能合約

**新開一個終端：**

```bash
cd "/Users/weiyeh/Desktop/區塊鏈/hackathon/1.Smart Contract Service"
npx hardhat run scripts/deploy.ts --network localhost
```

**記錄合約地址**（例如：`0x5FbDB2315678afecb367f032d93F642f64180aa3`）

### 3. 授予後端地址 ISSUER_ROLE 權限

```bash
cd "/Users/weiyeh/Desktop/區塊鏈/hackathon/1.Smart Contract Service"
npx hardhat run scripts/grantAndTestMint.js --network localhost
```

### 4. 啟動 Metadata Service

**新開一個終端：**

```bash
cd "/Users/weiyeh/Desktop/區塊鏈/hackathon/2.Metadata Service"
./mvnw spring-boot:run
```

**等待看到：**

```
Started MetadataServiceApplication in X.XXX seconds
```

### 5. 啟動 Backend Core API

**新開一個終端：**

```bash
cd "/Users/weiyeh/Desktop/區塊鏈/hackathon/3.Backend Core API"
./mvnw spring-boot:run
```

**等待看到：**

```
Started BackendCoreApplication in X.XXX seconds
```

### 6. 啟動 Verification Service

**新開一個終端：**

```bash
cd "/Users/weiyeh/Desktop/區塊鏈/hackathon/4.Verification Service"
./mvnw spring-boot:run
```

**等待看到：**

```
Started VerificationServiceApplication in X.XXX seconds
```

## ⚙️ 關鍵配置檢查

### Backend Core API 配置 (`3.Backend Core API/src/main/resources/application.yml`)

確保以下配置正確：

```yaml
blockchain:
  rpc-url: http://localhost:8545
  contract-address: "0x5FbDB2315678afecb367f032d93F642f64180aa3" # 使用步驟2的合約地址
  issuer-private-key: 59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
  gas-price: 20000000000
  gas-limit: 6721975
```

**重要：**

- `contract-address` 必須用雙引號包圍
- `issuer-private-key` 不要包含 `0x` 前綴
- 確保 `rpc-url` 指向正確的 Hardhat 節點

### Metadata Service 配置 (`2.Metadata Service/src/main/resources/application.yml`)

確保端口配置：

```yaml
server:
  port: 8081
```

### Verification Service 配置 (`4.Verification Service/src/main/resources/application.yml`)

確保端口配置：

```yaml
server:
  port: 8082
```

## 🔧 故障排除

### 問題 1：端口被佔用

**解決方案：**

```bash
# 檢查並殺死佔用端口的進程
lsof -ti:8081 | xargs kill -9 || true  # Metadata Service
lsof -ti:8082 | xargs kill -9 || true  # Verification Service
lsof -ti:8083 | xargs kill -9 || true  # Backend Core API
lsof -ti:8545 | xargs kill -9 || true  # Hardhat
```

### 問題 2：合約地址錯誤

**解決方案：**

1. 重新部署合約獲取新地址
2. 更新 `application.yml` 中的 `contract-address`
3. 重新授予權限

### 問題 3：私鑰錯誤

**解決方案：**
確保使用正確的私鑰：

- 地址：`0x70997970c51812dc3a010c7d01b50e0d17dc79c8`
- 私鑰：`59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d`

## ✅ 驗證測試

### 1. 檢查所有服務狀態

```bash
# 檢查 Hardhat
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
  http://localhost:8545

# 檢查 Metadata Service
curl http://localhost:8081/actuator/health

# 檢查 Backend Core API
curl http://localhost:8083/actuator/health

# 檢查 Verification Service
curl http://localhost:8082/actuator/health
```

### 2. 測試 API 發行代幣

```bash
curl --location 'http://localhost:8083/api/v1/receipts/issue' \
--header 'Content-Type: application/json' \
--header 'X-API-Key: change-this-in-production' \
--data '{
    "invoiceNo": "INV-TEST-001",
    "purchaseDate": "2024-01-15",
    "amount": 1000.5,
    "itemName": "測試商品",
    "ownerAddress": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    "description": "這是一個測試收據"
}' --max-time 35
```

**成功響應示例：**

```json
{
  "tokenId": 123456,
  "transactionHash": "0x19a265315cc",
  "metadataUri": "ipfs://xxx-xxx-xxx",
  "metadataHash": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "ownerAddress": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
  "success": true,
  "message": "Receipt issued successfully"
}
```

### 3. 驗證區塊鏈交易

```bash
# 檢查區塊號是否增加
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
  http://localhost:8545
```

## 📊 服務端口分配

| 服務                 | 端口 | 用途       |
| -------------------- | ---- | ---------- |
| Hardhat              | 8545 | 區塊鏈 RPC |
| Metadata Service     | 8081 | 元數據管理 |
| Verification Service | 8082 | 驗證服務   |
| Backend Core API     | 8083 | 主要 API   |
| Frontend DApp        | 3000 | 前端界面   |

## 🔄 重啟流程

如果需要重啟整個系統：

1. **停止所有服務**：`Ctrl+C` 在所有終端中
2. **清理端口**：使用上述端口清理命令
3. **按順序重啟**：按照本指南的順序重新啟動
4. **驗證配置**：確保所有配置正確
5. **運行測試**：執行驗證測試

## 🎉 成功指標

當您看到以下情況時，表示系統運行正常：

1. ✅ 所有服務健康檢查通過
2. ✅ API 返回 `success: true`
3. ✅ 區塊號持續增加
4. ✅ 交易哈希不為 null
5. ✅ 數據庫成功保存記錄

## 📞 支援

如果遇到問題：

1. 檢查日誌輸出中的錯誤信息
2. 確認所有配置正確
3. 驗證服務啟動順序
4. 檢查端口是否被佔用
5. 確認區塊鏈連接正常

---

**記住：** 這個 API `http://localhost:8083/api/v1/receipts/issue` 現在會真正與區塊鏈交互，每次成功調用都會產生新的區塊和代幣！
