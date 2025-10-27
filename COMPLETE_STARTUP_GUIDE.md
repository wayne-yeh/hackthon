# 完整啟動指南 - TAR 系統

## 📋 概述

本文檔提供完整的系統啟動流程，包括所有必要的配置更新步驟，確保 API 能夠成功在測試鏈上鑄造 Token。

## 🎯 前置要求

### 必需軟件

- Java 17 或更高版本
- Node.js 18+
- Maven 3.6+
- Hardhat

### 檢查端口

以下端口必須可用：

- `8545` - Hardhat 本地區塊鏈
- `8081` - Metadata Service
- `8082` - Verification Service
- `8083` - Backend Core API

## 🚀 完整啟動流程

### 步驟 1: 啟動 Hardhat 本地區塊鏈

```bash
cd "/Users/weiyeh/Desktop/區塊鏈/hackathon/1.Smart Contract Service"
npx hardhat node
```

**確認提示：**

- 看到 "Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545"
- 顯示 20 個預設帳戶及其私鑰

**重要：** 保持此終端運行，不要關閉。

---

### 步驟 2: 部署智能合約

在新的終端窗口中：

```bash
cd "/Users/weiyeh/Desktop/區塊鏈/hackathon/1.Smart Contract Service"
npx hardhat run scripts/deploy.ts --network localhost
```

**輸出示例：**

```
🚀 Deploying TARReceipt contract...
Deploying contracts with the account: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Account balance: 9999990784194683940718
✅ TARReceipt deployed to: 0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9
📄 Deployment info saved to: deploy/addresses.json
```

**記錄合約地址！** 在後續步驟中需要更新此地址。

---

### 步驟 3: 授予 ISSUER_ROLE 權限

使用新部署的合約地址運行：

```bash
cd "/Users/weiyeh/Desktop/區塊鏈/hackathon/1.Smart Contract Service"
npx hardhat run scripts/setIssuer.ts --network localhost
```

**輸出示例：**

```
🔐 Setting up ISSUER_ROLE...
Admin address: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Issuer address: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
Granting ISSUER_ROLE to: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
✅ ISSUER_ROLE granted successfully!
Transaction hash: 0x...
Role verification: ✅ Confirmed
```

---

### 步驟 4: 更新 Backend Core API 配置

編輯配置文件：

```bash
cd "/Users/weiyeh/Desktop/區塊鏈/hackathon/3.Backend Core API"
nano src/main/resources/application.yml
```

**必須更新的配置項：**

```yaml
blockchain:
  rpc-url: http://localhost:8545 # 確認 Hardhat 節點運行在 8545
  contract-address: "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9" # 從步驟 2 獲取的地址
  issuer-private-key: 59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d # 不含 0x 前綴
  gas-price: 20000000000
  gas-limit: 6721975
```

**重要提示：**

- `contract-address` 必須用**雙引號**包裹
- `issuer-private-key` **不能**包含 `0x` 前綴
- 這是第二個 Hardhat 帳戶的私鑰（`0x70997970C51812dc3A010C7d01b50e0d17dc79C8`）

---

### 步驟 5: 啟動 Backend Core API

```bash
cd "/Users/weiyeh/Desktop/區塊鏈/hackathon/3.Backend Core API"
./mvnw clean compile
./mvnw spring-boot:run
```

**成功啟動標誌：**

- 看到 `Started BackendCoreApplication in X.XXX seconds`
- 顯示 `✅ Blockchain credentials created successfully`
- 顯示 `✅ Contract found at address: 0x...`
- **沒有錯誤**

**等待 30-60 秒** 讓服務完全啟動。

---

### 步驟 6: 驗證系統運行

#### 6.1 測試 API 連接

```bash
curl http://localhost:8083/api/v1/receipts/actuator
```

應該返回 200 OK。

#### 6.2 測試鑄造功能

```bash
curl --location 'http://localhost:8083/api/v1/receipts/issue' \
--header 'Content-Type: application/json' \
--header 'X-API-Key: change-this-in-production' \
--data '{
    "invoiceNo": "TEST-001",
    "purchaseDate": "2024-01-15",
    "amount": 100.00,
    "itemName": "測試商品",
    "ownerAddress": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    "description": "測試描述"
}'
```

**成功響應示例：**

```json
{
  "tokenId": 12345,
  "transactionHash": "0x...",
  "metadataUri": "ipfs://...",
  "metadataHash": "...",
  "ownerAddress": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
  "success": true,
  "message": "Receipt issued successfully"
}
```

#### 6.3 驗證鏈上交易

```bash
cd "/Users/weiyeh/Desktop/區塊鏈/hackathon/1.Smart Contract Service"
npx hardhat run scripts/checkBalanceComplete.js --network localhost
```

**輸出示例：**

```
💰 Token 餘額: 13
🔢 當前 Token ID 計數器: 13
⏸️  合約狀態: 正常運行
```

---

## 🔧 配置更新檢查清單

在每次重新啟動前，請檢查以下配置：

### ✅ Backend Core API (`3.Backend Core API/src/main/resources/application.yml`)

- [ ] `contract-address` 是否正確（帶雙引號）
- [ ] `issuer-private-key` 是否正確（無 0x 前綴）
- [ ] `rpc-url` 是否為 `http://localhost:8545`

### ✅ Hardhat 部署狀態

- [ ] Hardhat 節點是否運行
- [ ] 合約是否部署
- [ ] ISSUER_ROLE 是否授予
- [ ] 當前區塊高度是否 > 0

### ✅ 服務健康檢查

檢查所有服務是否運行：

```bash
# 檢查 Backend Core API
curl http://localhost:8083/actuator/health

# 檢查 Hardhat
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

---

## 🚨 常見問題與解決方案

### 問題 1: `Port 8083 was already in use`

**解決方案：**

```bash
# 查找佔用 8083 端口的進程
lsof -ti:8083

# 終止進程（替換 PID 為實際的進程 ID）
kill -9 <PID>
```

### 問題 2: `Transaction receipt not found within 60 seconds`

**解決方案：**

- 確認 Hardhat 節點正在運行
- 檢查 `contract-address` 是否正確
- 重新部署合約並更新配置

### 問題 3: `Function selector mismatch`

**解決方案：**

- 重新部署合約
- 更新 `contract-address` 配置
- 重新授予 ISSUER_ROLE
- 重啟 Backend Core API

### 問題 4: `Unique index or primary key violation`

**解決方案：**

- 這是預期行為，表示 blockchain minting 成功了但 token ID 重複
- Token 仍然成功在鏈上鑄造
- 可以忽略此錯誤

### 問題 5: `Invalid address (argument="address", value=null)`

**解決方案：**

- 檢查 `application.yml` 中的 `contract-address` 是否用雙引號包裹
- 確認 Hardhat 節點已啟動

---

## 📝 重要配置值

### 合約地址

```
當前部署地址: 0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9
```

### Issuer 私鑰（不帶 0x）

```
私鑰: 59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
地址: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
```

### API Key

```
測試環境: change-this-in-production
```

### 網絡配置

```
RPC URL: http://localhost:8545
Chain ID: 31337
```

---

## 🎯 快速啟動腳本

創建一個快速啟動腳本 `quick-start.sh`：

```bash
#!/bin/bash
echo "🚀 啟動 TAR 系統..."

# 步驟 1: 啟動 Hardhat
echo "📦 啟動 Hardhat 節點..."
cd "1.Smart Contract Service"
npx hardhat node > /tmp/hardhat.log 2>&1 &
HARDHAT_PID=$!
echo "Hardhat PID: $HARDHAT_PID"
sleep 3

# 步驟 2: 部署合約
echo "📝 部署合約..."
npx hardhat run scripts/deploy.ts --network localhost

# 步驟 3: 授予權限
echo "🔐 授予 ISSUER_ROLE..."
npx hardhat run scripts/setIssuer.ts --network localhost

# 步驟 4: 啟動 Backend
echo "🌐 啟動 Backend Core API..."
cd "../3.Backend Core API"
./mvnw spring-boot:run > /tmp/backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

echo "✅ 系統啟動完成！"
echo "Hardhat 日誌: tail -f /tmp/hardhat.log"
echo "Backend 日誌: tail -f /tmp/backend.log"
```

使用方式：

```bash
chmod +x quick-start.sh
./quick-start.sh
```

---

## ✅ 系統啟動驗證清單

在開始測試前，確認以下項目：

- [ ] Hardhat 節點運行在 `localhost:8545`
- [ ] 合約已部署到正確地址
- [ ] ISSUER_ROLE 已授予
- [ ] Backend Core API 配置已更新
- [ ] Backend Core API 運行在 `localhost:8083`
- [ ] 能夠成功調用 `/api/v1/receipts/issue`
- [ ] 能夠查詢鏈上 Token 餘額

---

## 📚 相關文檔

- `SERVICE_STARTUP_GUIDE.md` - 服務啟動指南
- `API_TESTING_GUIDE.md` - API 測試指南
- `2.Metadata Service/README.md` - Metadata Service 文檔
- `3.Backend Core API/README.md` - Backend Core API 文檔

---

## 🆘 需要幫助？

如果遇到問題：

1. 檢查所有終端窗口的日誌
2. 確認 Hardhat 節點是否仍在運行
3. 驗證配置文件是否正確
4. 查看本文檔的"常見問題與解決方案"部分

---

**最後更新：** 2025-01-28
