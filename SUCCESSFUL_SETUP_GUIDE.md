# 成功啟動指南 - TAR 系統完整驗證

## 📋 概述

本文檔記錄了成功啟動 TAR 系統並驗證 `http://localhost:8083/api/v1/receipts/issue` API 的完整過程。所有服務現已正常運行，API 可以成功鑄造 Token。

## ✅ 成功驗證結果

### API 測試成功響應

```json
{
  "tokenId": 572489,
  "transactionHash": "0xb561fc047d3267192c1f9e55fe9900e0ca0b6004df3ef9d9f8660ff52e094bd0",
  "metadataUri": "ipfs://84cee3e1-1b91-4223-84a0-4bfc7d40be2f",
  "metadataHash": "6dee55705ad9769026a2e3eb46711be97d7856ae174358d7ce07b5d917682856",
  "ownerAddress": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
  "success": true,
  "message": "Receipt issued successfully"
}
```

## 🚀 成功啟動的服務

### 1. Hardhat 本地區塊鏈

- **狀態**: ✅ 運行中
- **端口**: `localhost:8545`
- **帳戶**: 20 個預設帳戶，每個 10000 ETH
- **合約地址**: `0x5FbDB2315678afecb367f032d93F642f64180aa3`

### 2. Backend Core API

- **狀態**: ✅ 運行中
- **端口**: `localhost:8083`
- **健康檢查**: `{"status":"UP"}`
- **區塊鏈連接**: ✅ 正常

### 3. Metadata Service

- **狀態**: ✅ 運行中
- **端口**: `localhost:8081`
- **健康檢查**: `{"status":"UP","components":{"diskSpace":{"status":"UP"},"ping":{"status":"UP"}}}`
- **元數據上傳**: ✅ 正常

## 🔧 解決的關鍵問題

### 問題 1: Hardhat 節點未運行

**症狀**: Backend 無法連接區塊鏈

```
❌ Error testing contract connection: Failed to connect to localhost/[0:0:0:0:0:0:0:1]:8545
```

**解決方案**:

```bash
cd "/Users/weiyeh/Desktop/區塊鏈/hackathon/1.Smart Contract Service"
npx hardhat node
```

### 問題 2: Metadata Service 未啟動

**症狀**: API 無法上傳元數據

```json
{
  "success": false,
  "message": "Failed to issue receipt: Failed to upload metadata: Connection refused: localhost/127.0.0.1:8081"
}
```

**解決方案**:

```bash
cd "/Users/weiyeh/Desktop/區塊鏈/hackathon/2.Metadata Service"
mvn spring-boot:run
```

**注意**: 該目錄沒有 `mvnw` 文件，需要使用系統的 `mvn` 命令。

### 問題 3: 私鑰配置錯誤

**症狀**: 交易失敗，資金不足

```json
{
  "success": false,
  "message": "Failed to issue receipt: Failed to mint receipt: Transaction failed: Sender doesn't have enough funds to send tx. The max upfront cost is: 36900000000000000 and the sender's balance is: 0."
}
```

**解決方案**: 更新 `3.Backend Core API/src/main/resources/application.yml`

```yaml
blockchain:
  issuer-private-key: 59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
```

### 問題 4: 文檔不一致

**症狀**: 端口和路徑錯誤

- API 文檔使用 `8080` 端口，實際使用 `8083`
- 健康檢查路徑錯誤

**解決方案**: 已修正所有文檔的端口和路徑一致性。

## 📝 完整啟動命令序列

### 步驟 1: 啟動 Hardhat

```bash
cd "/Users/weiyeh/Desktop/區塊鏈/hackathon/1.Smart Contract Service"
npx hardhat node
```

### 步驟 2: 部署合約（如果需要）

```bash
npx hardhat run scripts/deploy.ts --network localhost
```

### 步驟 3: 授予 ISSUER_ROLE

```bash
npx hardhat run scripts/setIssuer.ts --network localhost
```

### 步驟 4: 啟動 Backend Core API

```bash
cd "/Users/weiyeh/Desktop/區塊鏈/hackathon/3.Backend Core API"
./mvnw spring-boot:run
```

### 步驟 5: 啟動 Metadata Service

```bash
cd "/Users/weiyeh/Desktop/區塊鏈/hackathon/2.Metadata Service"
mvn spring-boot:run
```

## 🧪 驗證測試

### 健康檢查

```bash
# Backend Core API
curl http://localhost:8083/actuator/health

# Metadata Service
curl http://localhost:8081/actuator/health

# Hardhat
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

### API 測試

```bash
curl --location 'http://localhost:8083/api/v1/receipts/issue' \
  --header 'Content-Type: application/json' \
  --header 'X-API-Key: change-this-in-production' \
  --data '{
    "invoiceNo": "TEST-FINAL-001",
    "purchaseDate": "2024-01-15",
    "amount": 100.00,
    "itemName": "測試商品",
    "ownerAddress": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    "description": "測試描述"
  }'
```

## 📊 當前配置

### 合約配置

- **合約地址**: `0x5FbDB2315678afecb367f032d93F642f64180aa3`
- **RPC URL**: `http://localhost:8545`
- **Chain ID**: `31337`

### Issuer 配置

- **地址**: `0x70997970C51812dc3A010C7d01b50e0d17dc79C8`
- **私鑰**: `59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d`
- **餘額**: 10000 ETH

### API 配置

- **API Key**: `change-this-in-production`
- **Base URL**: `http://localhost:8083/api/v1`

## 🎯 可用的端點

### Backend Core API (8083)

- `POST /api/v1/receipts/issue` - 鑄造收據
- `POST /api/v1/receipts/verify` - 驗證收據
- `GET /api/v1/receipts/{tokenId}/details` - 獲取收據詳情
- `GET /actuator/health` - 健康檢查
- `GET /swagger-ui.html` - Swagger UI

### Metadata Service (8081)

- `POST /api/v1/metadata` - 上傳元數據
- `GET /api/v1/metadata/{id}` - 獲取元數據
- `GET /actuator/health` - 健康檢查

### Hardhat (8545)

- JSON-RPC 端點用於區塊鏈交互

## 🔍 故障排除

### 如果服務無法啟動

1. 檢查端口是否被佔用: `lsof -ti:8083`
2. 終止佔用進程: `kill -9 <PID>`
3. 重新啟動服務

### 如果 API 調用失敗

1. 確認所有服務都在運行
2. 檢查健康檢查端點
3. 驗證配置文件的私鑰和合約地址

### 如果區塊鏈連接失敗

1. 確認 Hardhat 節點正在運行
2. 檢查 RPC URL 配置
3. 重新部署合約並更新地址

## 📚 相關文檔

- `COMPLETE_STARTUP_GUIDE.md` - 完整啟動指南
- `3.Backend Core API/API_DOCUMENTATION.md` - API 文檔
- `2.Metadata Service/README.md` - Metadata Service 文檔

## 🎉 成功標誌

當看到以下響應時，表示系統完全正常：

```json
{
  "tokenId": <number>,
  "transactionHash": "0x...",
  "metadataUri": "ipfs://...",
  "metadataHash": "...",
  "ownerAddress": "0x...",
  "success": true,
  "message": "Receipt issued successfully"
}
```

---

**最後更新**: 2025-01-28  
**狀態**: ✅ 所有服務正常運行，API 完全可用

