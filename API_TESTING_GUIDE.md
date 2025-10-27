# TAR 系統 API 測試指南

## 🚀 快速開始

### 1. 啟動所有服務

```bash
# 1. 啟動 Hardhat 區塊鏈
cd "1.Smart Contract Service"
npx hardhat node

# 2. 啟動 Metadata Service
cd "2.Metadata Service"
./mvnw spring-boot:run

# 3. 啟動 Backend Core API
cd "3.Backend Core API"
./mvnw spring-boot:run

# 4. 啟動 Verification Service
cd "4.Verification Service"
./mvnw spring-boot:run

# 5. 啟動 Frontend DApp
cd "5.Frontend DApp"
npm run dev
```

### 2. 服務端口

- **Hardhat 區塊鏈**: `http://localhost:8545`
- **Metadata Service**: `http://localhost:8081`
- **Backend Core API**: `http://localhost:8083`
- **Verification Service**: `http://localhost:8082`
- **Frontend DApp**: `http://localhost:3000`

---

## 📋 API 測試命令

### 🔍 健康檢查

```bash
# 檢查所有服務狀態
curl -X GET "http://localhost:8081/actuator/health"
curl -X GET "http://localhost:8083/actuator/health"
curl -X GET "http://localhost:8082/actuator/health"
```

### 🪙 發行收據 (Issue Receipt)

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

### 🔍 查詢收據

```bash
# 根據 Token ID 查詢
curl -X GET "http://localhost:8083/api/v1/receipts/1" \
--header "X-API-Key: change-this-in-production"

# 根據所有者地址查詢
curl -X GET "http://localhost:8083/api/v1/receipts/owner/0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266" \
--header "X-API-Key: change-this-in-production"
```

### ✅ 驗證收據

```bash
curl -X POST "http://localhost:8082/api/v1/verify" \
--header "Content-Type: application/json" \
--header "X-API-Key: change-this-in-production" \
--data '{
    "tokenId": 1,
    "ownerAddress": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
}'
```

### 🗑️ 撤銷收據

```bash
curl -X POST "http://localhost:8083/api/v1/receipts/1/revoke" \
--header "X-API-Key: change-this-in-production"
```

---

## 🧪 測試場景

### 場景 1: 完整流程測試

```bash
# 1. 發行收據
echo "=== 發行收據 ==="
curl --location 'http://localhost:8083/api/v1/receipts/issue' \
--header 'Content-Type: application/json' \
--header 'X-API-Key: change-this-in-production' \
--data '{
    "invoiceNo": "INV-FULL-TEST-001",
    "purchaseDate": "2024-01-15",
    "amount": 2500.00,
    "itemName": "黃金條",
    "ownerAddress": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    "description": "999純金條 100g"
}' | jq '.'

# 2. 查詢收據
echo -e "\n=== 查詢收據 ==="
curl -X GET "http://localhost:8083/api/v1/receipts/owner/0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266" \
--header "X-API-Key: change-this-in-production" | jq '.'

# 3. 驗證收據
echo -e "\n=== 驗證收據 ==="
curl -X POST "http://localhost:8082/api/v1/verify" \
--header "Content-Type: application/json" \
--header "X-API-Key: change-this-in-production" \
--data '{
    "tokenId": 1,
    "ownerAddress": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
}' | jq '.'
```

### 場景 2: 多個收據測試

```bash
# 發行多個收據
for i in {1..3}; do
    echo "=== 發行收據 $i ==="
    curl --location 'http://localhost:8083/api/v1/receipts/issue' \
    --header 'Content-Type: application/json' \
    --header 'X-API-Key: change-this-in-production' \
    --data "{
        \"invoiceNo\": \"INV-BATCH-$i\",
        \"purchaseDate\": \"2024-01-15\",
        \"amount\": $((1000 + i * 100)).00,
        \"itemName\": \"商品 $i\",
        \"ownerAddress\": \"0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266\",
        \"description\": \"批量測試商品 $i\"
    }" | jq '.'
    echo ""
done
```

### 場景 3: 錯誤處理測試

```bash
# 測試重複發票號
echo "=== 測試重複發票號 ==="
curl --location 'http://localhost:8083/api/v1/receipts/issue' \
--header 'Content-Type: application/json' \
--header 'X-API-Key: change-this-in-production' \
--data '{
    "invoiceNo": "INV-DUPLICATE",
    "purchaseDate": "2024-01-15",
    "amount": 1000.00,
    "itemName": "測試商品",
    "ownerAddress": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    "description": "第一次發行"
}' | jq '.'

curl --location 'http://localhost:8083/api/v1/receipts/issue' \
--header 'Content-Type: application/json' \
--header 'X-API-Key: change-this-in-production' \
--data '{
    "invoiceNo": "INV-DUPLICATE",
    "purchaseDate": "2024-01-15",
    "amount": 1000.00,
    "itemName": "測試商品",
    "ownerAddress": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    "description": "第二次發行（應該失敗）"
}' | jq '.'
```

---

## 🔧 區塊鏈操作

### 檢查區塊鏈狀態

```bash
# 檢查區塊鏈連接
curl -X POST -H "Content-Type: application/json" \
--data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
http://localhost:8545

# 檢查合約代碼
curl -X POST -H "Content-Type: application/json" \
--data '{"jsonrpc":"2.0","method":"eth_getCode","params":["0x5FbDB2315678afecb367f032d93F642f64180aa3", "latest"],"id":1}' \
http://localhost:8545
```

### 使用 Hardhat 腳本

```bash
# 授予 ISSUER_ROLE 權限
cd "1.Smart Contract Service"
npx hardhat run scripts/grantIssuerRole.js --network localhost

# 測試 mint 函數
npx hardhat run scripts/testBackendMint.js --network localhost
```

---

## 📊 預期結果

### 成功發行收據

```json
{
  "tokenId": 1,
  "transactionHash": "0x...",
  "metadataUri": "ipfs://...",
  "metadataHash": "0x...",
  "ownerAddress": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
  "success": true,
  "message": "Receipt issued successfully"
}
```

### 成功驗證收據

```json
{
  "valid": true,
  "tokenId": 1,
  "ownerAddress": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
  "metadataUri": "ipfs://...",
  "metadataHash": "0x...",
  "message": "Receipt is valid"
}
```

---

## 🐛 故障排除

### 常見問題

1. **服務未啟動**

   ```bash
   # 檢查端口是否被占用
   lsof -i :8081
   lsof -i :8083
   lsof -i :8082
   ```

2. **區塊鏈連接失敗**

   ```bash
   # 檢查 Hardhat 是否運行
   curl -X POST -H "Content-Type: application/json" \
   --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
   http://localhost:8545
   ```

3. **權限問題**
   ```bash
   # 重新授予權限
   cd "1.Smart Contract Service"
   npx hardhat run scripts/grantIssuerRole.js --network localhost
   ```

### 日誌檢查

```bash
# 查看後端日誌
tail -f "3.Backend Core API/logs/application.log"

# 查看區塊鏈日誌
# Hardhat 會在終端顯示日誌
```

---

## 🎯 測試檢查清單

- [ ] 所有服務正常啟動
- [ ] 區塊鏈連接正常
- [ ] 合約部署成功
- [ ] ISSUER_ROLE 權限已授予
- [ ] 可以成功發行收據
- [ ] 可以查詢收據
- [ ] 可以驗證收據
- [ ] 可以撤銷收據
- [ ] 錯誤處理正常

---

## 📝 注意事項

1. **API Key**: 所有請求都需要 `X-API-Key: change-this-in-production` 頭部
2. **地址格式**: 以太坊地址必須是有效的 40 字符十六進制格式
3. **金額格式**: 金額使用小數點格式，如 `1000.50`
4. **日期格式**: 使用 `YYYY-MM-DD` 格式
5. **Token ID**: 從 1 開始遞增

---

## 🚀 快速測試腳本

創建一個 `test-api.sh` 文件：

```bash
#!/bin/bash

echo "🧪 開始 TAR 系統 API 測試..."

# 健康檢查
echo "1. 檢查服務健康狀態..."
curl -s -X GET "http://localhost:8083/actuator/health" | jq '.'

# 發行收據
echo -e "\n2. 發行測試收據..."
RESPONSE=$(curl -s --location 'http://localhost:8083/api/v1/receipts/issue' \
--header 'Content-Type: application/json' \
--header 'X-API-Key: change-this-in-production' \
--data '{
    "invoiceNo": "INV-QUICK-TEST",
    "purchaseDate": "2024-01-15",
    "amount": 1000.00,
    "itemName": "快速測試商品",
    "ownerAddress": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    "description": "快速測試"
}')

echo $RESPONSE | jq '.'

# 提取 Token ID
TOKEN_ID=$(echo $RESPONSE | jq -r '.tokenId // empty')

if [ ! -z "$TOKEN_ID" ]; then
    echo -e "\n3. 查詢收據 (Token ID: $TOKEN_ID)..."
    curl -s -X GET "http://localhost:8083/api/v1/receipts/$TOKEN_ID" \
    --header "X-API-Key: change-this-in-production" | jq '.'

    echo -e "\n4. 驗證收據..."
    curl -s -X POST "http://localhost:8082/api/v1/verify" \
    --header "Content-Type: application/json" \
    --header "X-API-Key: change-this-in-production" \
    --data "{
        \"tokenId\": $TOKEN_ID,
        \"ownerAddress\": \"0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266\"
    }" | jq '.'
else
    echo "❌ 發行收據失敗，跳過後續測試"
fi

echo -e "\n✅ 測試完成！"
```

使用方法：

```bash
chmod +x test-api.sh
./test-api.sh
```
